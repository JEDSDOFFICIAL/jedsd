/**
 * POST /api/paper/[paperId]/accept-revision
 *
 * Editor accepts the submitted revision — no further review needed.
 * Sets paper status → ACCEPTED.
 * Body: { comments?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuditAction, EditorDecision, PaperStatus } from "@prisma/client";
import { sendPaperStatusNotificationMail } from "@/helper/send_paper_status_notification_mail";

const bodySchema = z.object({
  comments: z.string().optional(),
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
      return NextResponse.json({ success: false, message: "Forbidden: Editor or Admin required." }, { status: 403 });
    }

    const { paperId } = await context.params;
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: { author: true },
    });
    if (!paper) return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });

    // Must be in REVISION_SUBMITTED or EDITOR_DECISION to accept
    const allowedStatuses: PaperStatus[] = [
      PaperStatus.REVISION_SUBMITTED,
      PaperStatus.EDITOR_DECISION,
      PaperStatus.ON_REVIEW,
    ];
    if (!allowedStatuses.includes(paper.status)) {
      return NextResponse.json(
        { success: false, message: `Cannot accept revision from status: ${paper.status}` },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    const comments = parsed.success ? parsed.data.comments : undefined;

    const updatedPaper = await prisma.$transaction(async (tx) => {
      const updated = await tx.researchPaper.update({
        where: { id: paper.id },
        data: {
          status: PaperStatus.ACCEPTED,
          editorDecision: EditorDecision.ACCEPT,
          acceptedDate: new Date(),
          ...(comments ? { editorComments: comments } : {}),
        },
      });

      await tx.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: AuditAction.EDITOR_ACCEPTED_REVISION,
          metadata: { comments: comments ?? null },
        },
      });

      return updated;
    });

    // Notify author
    const poc = paper.pointOfContact as { email?: string } | null;
    const emails: string[] = [];
    if (paper.author?.email) emails.push(paper.author.email);
    if (poc?.email && !emails.includes(poc.email)) emails.push(poc.email);

    if (emails.length > 0) {
      sendPaperStatusNotificationMail({
        paper: updatedPaper,
        recipientEmails: emails,
        status: "ACCEPTED",
        message: comments ?? "Congratulations! Your revised manuscript has been accepted for publication.",
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Revision accepted. Paper status set to ACCEPTED.",
      paper: updatedPaper,
    });
  } catch (error: any) {
    console.error("accept-revision error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
