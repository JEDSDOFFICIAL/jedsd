/**
 * GET  /api/paper/[paperId]/review-rounds
 *   Returns all review rounds with their reviewer assignments and submitted reviews.
 *   Role: EDITOR, ADMIN, or REVIEWER assigned to the paper.
 *
 * POST /api/paper/[paperId]/review-rounds
 *   Editor starts a new review round for the current revision.
 *   Optionally assigns reviewers immediately.
 *   Sets paper status → ON_REVIEW.
 *   Sets visibleToReviewers = true on the latest revision.
 *   Creates ManuscriptFile records with REVIEWER_ASSIGNED access for the revised manuscript.
 *
 *   Body:
 *     reviewerIds         string[]   reviewer User IDs
 *     revisionId?         string     which revision to send (defaults to latest)
 *     shareManuscript?    boolean    (default true)  share revised manuscript with reviewers
 *     shareCoverLetter?   boolean    (default false) share cover letter with reviewers
 *     shareSourceZip?     boolean    (default false) share source ZIP with reviewers
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  AuditAction,
  FileAccessLevel,
  ManuscriptFileType,
  PaperStatus,
  ReviewerStatus,
} from "@prisma/client";
import { sendReviewerAllocationMail } from "@/helper/send_reviewer_allocation_mail";

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });

    const { paperId } = await context.params;
    const paper = await prisma.researchPaper.findFirst({
      where: { OR: [{ id: paperId }, { paperId }] },
    });
    if (!paper) return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });

    const role = user.variableUserType;
    const isEditorOrAdmin = role === "EDITOR" || role === "ADMIN";
    const isAssignedReviewer = role === "REVIEWER"
      ? !!(await prisma.paperReview.findFirst({ where: { paperId: paper.id, reviewerId: user.id } }))
      : false;

    if (!isEditorOrAdmin && !isAssignedReviewer) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const rounds = await prisma.reviewRound.findMany({
      where: { paperId: paper.id },
      orderBy: { roundNumber: "asc" },
      include: {
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, affiliation: true },
            },
          },
        },
        revisions: {
          include: {
            files: true,
            submittedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Reviewers only see their own review data
    if (isAssignedReviewer) {
      const filtered = rounds.map((r) => ({
        ...r,
        reviews: r.reviews.filter((rev) => rev.reviewerId === user.id),
      }));
      return NextResponse.json({ success: true, rounds: filtered });
    }

    return NextResponse.json({ success: true, rounds });
  } catch (error: any) {
    console.error("review-rounds GET error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}

// ─── POST ────────────────────────────────────────────────────────────────────

const startRoundSchema = z.object({
  reviewerIds: z.array(z.string().uuid()).min(1, "At least one reviewer required."),
  revisionId: z.string().uuid().optional(),
  shareManuscript: z.boolean().default(true),
  shareCoverLetter: z.boolean().default(false),
  shareSourceZip: z.boolean().default(false),
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
    if (!user) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });

    const { canAssignReviewer } = await import("@/lib/permissions");
    const hasPermission = await canAssignReviewer(session.user as any);
    if (!hasPermission) {
      return NextResponse.json({ success: false, message: "Forbidden: Editor or Admin required." }, { status: 403 });
    }

    const { paperId } = await context.params;
    const paper = await prisma.researchPaper.findFirst({
      where: { OR: [{ id: paperId }, { paperId }] },
    });
    if (!paper) return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });

    const body = await req.json();
    const parsed = startRoundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request.", errors: parsed.error.errors }, { status: 400 });
    }

    const { reviewerIds, revisionId, shareManuscript, shareCoverLetter, shareSourceZip } = parsed.data;

    // Validate reviewer IDs
    const reviewers = await prisma.user.findMany({ where: { id: { in: reviewerIds } } });
    if (reviewers.length !== reviewerIds.length) {
      return NextResponse.json({ success: false, message: "One or more reviewer IDs are invalid." }, { status: 400 });
    }

    // Determine the revision to share
    const targetRevision = revisionId
      ? await prisma.manuscriptRevision.findUnique({ where: { id: revisionId }, include: { files: true } })
      : await prisma.manuscriptRevision.findFirst({
          where: { paperId: paper.id },
          orderBy: { revisionNumber: "desc" },
          include: { files: true },
        });

    // Determine next round number
    const latestRound = await prisma.reviewRound.findFirst({
      where: { paperId: paper.id },
      orderBy: { roundNumber: "desc" },
    });
    const nextRoundNumber = latestRound ? latestRound.roundNumber + 1 : 1;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create new review round
      const newRound = await tx.reviewRound.create({
        data: {
          paperId: paper.id,
          roundNumber: nextRoundNumber,
          createdById: user.id,
        },
      });

      // 2. Create PaperReview (assignment) for each reviewer
      const assignments = await Promise.all(
        reviewerIds.map((rid) =>
          tx.paperReview.create({
            data: {
              paperId: paper.id,
              reviewerId: rid,
              reviewRoundId: newRound.id,
              reviewText: "",
              reviewerStatus: ReviewerStatus.PENDING,
            },
          })
        )
      );

      // 3. If there's a revision, mark it visible to reviewers and grant file access
      if (targetRevision) {
        await tx.manuscriptRevision.update({
          where: { id: targetRevision.id },
          data: { visibleToReviewers: true },
        });

        // Update file access levels based on editor's choices
        for (const file of targetRevision.files) {
          const isManuscript =
            file.fileType === ManuscriptFileType.MANUSCRIPT_PDF ||
            file.fileType === ManuscriptFileType.MANUSCRIPT_DOCX;
          const isCoverLetter = file.fileType === ManuscriptFileType.COVER_LETTER;
          const isSourceZip = file.fileType === ManuscriptFileType.SOURCE_ZIP;

          let newAccessLevel: FileAccessLevel | null = null;
          if (isManuscript && shareManuscript) newAccessLevel = FileAccessLevel.REVIEWER_ASSIGNED;
          if (isCoverLetter && shareCoverLetter) newAccessLevel = FileAccessLevel.REVIEWER_ASSIGNED;
          if (isSourceZip && shareSourceZip) newAccessLevel = FileAccessLevel.REVIEWER_ASSIGNED;

          if (newAccessLevel) {
            await tx.manuscriptFile.update({
              where: { id: file.id },
              data: { accessLevel: newAccessLevel },
            });
          }
        }
      }

      // 4. Update paper status → ON_REVIEW
      await tx.researchPaper.update({
        where: { id: paper.id },
        data: { status: PaperStatus.ON_REVIEW },
      });

      // 5. Audit log
      await tx.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: AuditAction.REVIEW_ROUND_CREATED,
          metadata: {
            roundNumber: nextRoundNumber,
            reviewerIds,
            revisionId: targetRevision?.id ?? null,
            shareManuscript,
            shareCoverLetter,
            shareSourceZip,
          },
        },
      });

      await tx.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: AuditAction.EDITOR_SENT_REVISION_FOR_REVIEW,
          metadata: { roundNumber: nextRoundNumber, revisionId: targetRevision?.id ?? null },
        },
      });

      return { newRound, assignments };
    });

    // Send emails to reviewers (non-blocking)
    Promise.allSettled(
      reviewers.map((reviewer) =>
        sendReviewerAllocationMail({
          paper,
          reviewerName: reviewer.name,
          revieweremail: reviewer.email,
        })
      )
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Review round ${nextRoundNumber} started with ${reviewerIds.length} reviewer(s).`,
      round: result.newRound,
      assignments: result.assignments,
    }, { status: 201 });
  } catch (error: any) {
    console.error("review-rounds POST error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
