/**
 * POST /api/paper/[paperId]/request-revision
 *
 * Editor requests a revision from the author.
 * - paperId param = UUID (internal id)
 * - Requires EDITOR or ADMIN role
 * - Sets paper status → REVISION_REQUESTED
 * - Stores editorDecision + editorComments on the paper
 * - Creates a ReviewRound record for the current round (if not already created)
 * - Writes an audit log entry
 * - Sends notification email to author / point-of-contact
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuditAction, PaperStatus, EditorDecision } from "@prisma/client";
import { sendRevisionRequestedMail } from "@/helper/send_revision_requested_mail";

const bodySchema = z.object({
  comments: z.string().min(10, "Comments must be at least 10 characters."),
  decision: z.nativeEnum(EditorDecision).optional().default(EditorDecision.MINOR_REVISION),
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
    if (!user || (user.variableUserType !== "EDITOR" && user.variableUserType !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Forbidden: Editor or Admin role required." }, { status: 403 });
    }

    const { paperId } = await context.params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request.", errors: parsed.error.errors }, { status: 400 });
    }

    const { comments, decision } = parsed.data;

    // Find paper by UUID id
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: { author: true },
    });
    if (!paper) {
      return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });
    }

    // Allowed transition check
    const allowedFromStatuses: PaperStatus[] = [
      PaperStatus.ON_REVIEW,
      PaperStatus.EDITOR_DECISION,
      PaperStatus.REVISION_SUBMITTED,
    ];
    if (!allowedFromStatuses.includes(paper.status)) {
      return NextResponse.json(
        { success: false, message: `Cannot request revision from status: ${paper.status}` },
        { status: 409 }
      );
    }

    // Determine current review round number
    const latestRound = await prisma.reviewRound.findFirst({
      where: { paperId: paper.id },
      orderBy: { roundNumber: "desc" },
    });
    const roundNumber = latestRound ? latestRound.roundNumber : 1;

    // Create a ReviewRound if one doesn't already exist for this paper
    let reviewRound = latestRound;
    if (!reviewRound) {
      reviewRound = await prisma.reviewRound.create({
        data: {
          paperId: paper.id,
          roundNumber: 1,
          createdById: user.id,
        },
      });
    }

    // Update paper status and editor decision atomically
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paper.id },
      data: {
        status: PaperStatus.REVISION_REQUESTED,
        editorDecision: decision,
        editorComments: comments,
      },
    });

    // Audit log
    await prisma.manuscriptAuditLog.create({
      data: {
        paperId: paper.id,
        userId: user.id,
        action: AuditAction.EDITOR_REQUESTED_REVISION,
        metadata: { decision, roundNumber, comments: comments.substring(0, 200) },
      },
    });

    // Send notification to author / POC
    const poc = paper.pointOfContact as { email?: string; fullName?: string } | null;
    const recipientEmails: string[] = [];
    if (paper.author?.email) recipientEmails.push(paper.author.email);
    if (poc?.email && !recipientEmails.includes(poc.email)) recipientEmails.push(poc.email);

    if (recipientEmails.length > 0) {
      await sendRevisionRequestedMail({
        paper: updatedPaper,
        recipientEmails,
        editorComments: comments,
        decision,
        roundNumber,
      }).catch((e) => console.error("Email send failed (non-blocking):", e));
    }

    return NextResponse.json({
      success: true,
      message: "Revision requested successfully.",
      paper: updatedPaper,
    });
  } catch (error: any) {
    console.error("request-revision error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
