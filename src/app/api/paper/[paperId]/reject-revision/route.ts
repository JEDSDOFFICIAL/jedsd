/**
 * POST /api/paper/[paperId]/reject-revision
 *
 * Editor rejects the paper after reviewing the revision.
 * Sets paper status → REJECTED.
 * Body: { comments: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuditAction, EditorDecision, PaperStatus } from "@prisma/client";
import { sendPaperStatusNotificationMail } from "@/helper/send_paper_status_notification_mail";

const bodySchema = z.object({
  comments: z.string().min(10, "Please provide a reason for rejection."),
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

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request.", errors: parsed.error.errors }, { status: 400 });
    }

    const { comments } = parsed.data;

    const updatedPaper = await prisma.$transaction(async (tx) => {
      const updated = await tx.researchPaper.update({
        where: { id: paper.id },
        data: {
          status: PaperStatus.REJECTED,
          editorDecision: EditorDecision.REJECT,
          editorComments: comments,
        },
      });

      await tx.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: AuditAction.EDITOR_REJECTED_PAPER,
          metadata: { comments },
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
        status: "REJECTED",
        message: comments,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Paper rejected.",
      paper: updatedPaper,
    });
  } catch (error: any) {
    console.error("reject-revision error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
