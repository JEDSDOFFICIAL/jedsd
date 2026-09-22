/**
 * POST /api/paper/[paperId]/submit-revision
 *
 * Author submits a revised manuscript.
 *
 * CRITICAL RULE:  Revised files go ONLY to the Editor first.
 *                 All ManuscriptFile records are created with accessLevel = AUTHOR_EDITOR.
 *                 The cover letter and source ZIP use EDITOR_ONLY.
 *                 Reviewers NEVER automatically receive these files.
 *
 * Body (JSON):
 *   revisedManuscriptUrl  string  (Firebase URL — PDF / DOCX)
 *   revisedManuscriptName string
 *   revisedManuscriptSize number  (bytes)
 *   revisedManuscriptType "MANUSCRIPT_PDF" | "MANUSCRIPT_DOCX"
 *   coverLetterUrl?       string  (Firebase URL — EDITOR_ONLY)
 *   coverLetterName?      string
 *   coverLetterSize?      number
 *   sourceZipUrl?         string  (Firebase URL — EDITOR_ONLY)
 *   sourceZipName?        string
 *   sourceZipSize?        number
 *   responseToReviewers?  string  (free text or Firebase URL)
 *   revisionNotes?        string
 *
 * The client uploads files to Firebase first, then calls this endpoint with the URLs.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canEditManuscript } from "@/lib/permissions";
import {
  AuditAction,
  FileAccessLevel,
  ManuscriptFileType,
  PaperStatus,
} from "@prisma/client";
import { sendRevisionSubmittedToEditorMail } from "@/helper/send_revision_submitted_mail";

const bodySchema = z.object({
  revisedManuscriptUrl: z.string().url("Invalid manuscript URL."),
  revisedManuscriptName: z.string().min(1),
  revisedManuscriptSize: z.number().int().positive().optional(),
  revisedManuscriptType: z.enum(["MANUSCRIPT_PDF", "MANUSCRIPT_DOCX"]).default("MANUSCRIPT_PDF"),

  coverLetterUrl: z.string().url().optional().nullable(),
  coverLetterName: z.string().optional().nullable(),
  coverLetterSize: z.number().int().positive().optional().nullable(),

  sourceZipUrl: z.string().url().optional().nullable(),
  sourceZipName: z.string().optional().nullable(),
  sourceZipSize: z.number().int().positive().optional().nullable(),

  responseToReviewers: z.string().optional().nullable(),
  revisionNotes: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const { paperId } = await context.params;

    // Find paper
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: { author: true },
    });
    if (!paper) {
      return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });
    }

    // Only the paper's own author (or admin) can submit a revision
    const canEdit = await canEditManuscript(session.user as any, paper.authorId);
    if (!canEdit) {
      return NextResponse.json({ success: false, message: "Forbidden: Only the paper author can submit revisions." }, { status: 403 });
    }

    // Status must be REVISION_REQUESTED
    if (paper.status !== PaperStatus.REVISION_REQUESTED) {
      return NextResponse.json(
        { success: false, message: `Cannot submit revision from status: ${paper.status}. Status must be REVISION_REQUESTED.` },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request.", errors: parsed.error.errors }, { status: 400 });
    }

    const {
      revisedManuscriptUrl,
      revisedManuscriptName,
      revisedManuscriptSize,
      revisedManuscriptType,
      coverLetterUrl,
      coverLetterName,
      coverLetterSize,
      sourceZipUrl,
      sourceZipName,
      sourceZipSize,
      responseToReviewers,
      revisionNotes,
    } = parsed.data;

    // Determine next revision number
    const latestRevision = await prisma.manuscriptRevision.findFirst({
      where: { paperId: paper.id },
      orderBy: { revisionNumber: "desc" },
    });
    const revisionNumber = latestRevision ? latestRevision.revisionNumber + 1 : 1;

    // Get the latest review round (the one that triggered this revision)
    const latestRound = await prisma.reviewRound.findFirst({
      where: { paperId: paper.id },
      orderBy: { roundNumber: "desc" },
    });

    // Create revision + files in a transaction
    const revision = await prisma.$transaction(async (tx) => {
      // 1. Create revision record
      const rev = await tx.manuscriptRevision.create({
        data: {
          paperId: paper.id,
          revisionNumber,
          submittedById: user.id,
          responseToReviewers: responseToReviewers ?? null,
          revisionNotes: revisionNotes ?? null,
          visibleToReviewers: false, // Always starts false — editor decides
          triggeredByRoundId: latestRound?.id ?? null,
        },
      });

      // 2. Create file records — NEVER overwrite old ones
      const fileRecords = [];

      // Revised manuscript — author + editor can access
      fileRecords.push(
        tx.manuscriptFile.create({
          data: {
            paperId: paper.id,
            revisionId: rev.id,
            fileType: revisedManuscriptType as ManuscriptFileType,
            filePath: revisedManuscriptUrl,
            fileName: revisedManuscriptName,
            fileSize: revisedManuscriptSize ?? null,
            uploadedById: user.id,
            accessLevel: FileAccessLevel.AUTHOR_EDITOR,
          },
        })
      );

      // Cover letter — editor only
      if (coverLetterUrl) {
        fileRecords.push(
          tx.manuscriptFile.create({
            data: {
              paperId: paper.id,
              revisionId: rev.id,
              fileType: ManuscriptFileType.COVER_LETTER,
              filePath: coverLetterUrl,
              fileName: coverLetterName ?? "cover-letter",
              fileSize: coverLetterSize ?? null,
              uploadedById: user.id,
              accessLevel: FileAccessLevel.EDITOR_ONLY, // CRITICAL: cover letter → editor only
            },
          })
        );
      }

      // Source ZIP — editor only
      if (sourceZipUrl) {
        fileRecords.push(
          tx.manuscriptFile.create({
            data: {
              paperId: paper.id,
              revisionId: rev.id,
              fileType: ManuscriptFileType.SOURCE_ZIP,
              filePath: sourceZipUrl,
              fileName: sourceZipName ?? "source.zip",
              fileSize: sourceZipSize ?? null,
              uploadedById: user.id,
              accessLevel: FileAccessLevel.EDITOR_ONLY, // CRITICAL: source ZIP → editor only
            },
          })
        );
      }

      await Promise.all(fileRecords);

      // 3. Update paper status → REVISION_SUBMITTED
      await tx.researchPaper.update({
        where: { id: paper.id },
        data: { status: PaperStatus.REVISION_SUBMITTED },
      });

      // 4. Audit log
      await tx.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: AuditAction.AUTHOR_SUBMITTED_REVISION,
          metadata: {
            revisionNumber,
            roundTriggered: latestRound?.roundNumber ?? null,
            hasManuscript: true,
            hasCoverLetter: !!coverLetterUrl,
            hasSourceZip: !!sourceZipUrl,
            hasResponse: !!responseToReviewers,
          },
        },
      });

      return rev;
    });

    // Send notification to editorial team (non-blocking)
    sendRevisionSubmittedToEditorMail({ paper, revisionNumber, authorName: user.name })
      .catch((e) => console.error("Email failed (non-blocking):", e));

    return NextResponse.json({
      success: true,
      message: "Revision submitted successfully. The editor has been notified.",
      revisionId: revision.id,
      revisionNumber,
    }, { status: 201 });
  } catch (error: any) {
    console.error("submit-revision error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
