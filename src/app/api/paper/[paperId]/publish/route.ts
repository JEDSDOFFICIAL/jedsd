/**
 * PATCH /api/paper/[paperId]/publish
 *
 * Publishes a paper (sets status → PUBLISH / ACCEPTED / REJECTED).
 *
 * SECURITY: Only ADMIN or users with canPublish = true are allowed.
 *   Normal EDITOR, REVIEWER, AUTHOR → 403 Forbidden.
 *
 * Body: { status: "ACCEPTED" | "REJECTED" | "PUBLISH", doi?: string }
 */

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction, PaperStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPaperPublicationMail } from "@/helper/send_paper_publication_mail";
import { canPublish } from "@/lib/permissions";

const paperIdParamSchema = z.object({
  paperId: z.string().uuid("Invalid paper ID format."),
});

const updatePaperStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "PUBLISH"] as const),
  doi: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    // ── Permission check ──────────────────────────────────────────────────────
    const hasPublishPermission = await canPublish(session.user as any);

    if (!hasPublishPermission) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Forbidden: Publishing requires explicit publication permission. " +
            "Contact an administrator to grant this permission.",
        },
        { status: 403 }
      );
    }

    // ── Params ────────────────────────────────────────────────────────────────
    const { paperId } = await context.params;
    const paperIdResult = paperIdParamSchema.safeParse({ paperId });
    if (!paperIdResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid paper ID.", errors: paperIdResult.error.errors },
        { status: 400 }
      );
    }

    const body = await req.json();
    const bodyResult = updatePaperStatusSchema.safeParse(body);
    if (!bodyResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid status.", errors: bodyResult.error.errors },
        { status: 400 }
      );
    }

    const { status, doi } = bodyResult.data;

    // ── Update ────────────────────────────────────────────────────────────────
    const updatedPaper = await prisma.$transaction(async (tx) => {
      const updated = await tx.researchPaper.update({
        where: { id: paperId },
        data: {
          status: status as PaperStatus,
          acceptedDate:
            status === "ACCEPTED" || status === "PUBLISH" ? new Date() : null,
          ...(doi !== undefined ? { doi: doi ?? undefined } : {}),
        },
        include: {
          author: { select: { name: true, email: true } },
        },
      });

      if (status === "PUBLISH") {
        await tx.manuscriptAuditLog.create({
          data: {
            paperId,
            userId: user.id,
            action: AuditAction.PAPER_PUBLISHED,
            metadata: { doi: doi ?? null, publishedBy: user.email },
          },
        });
      }

      return updated;
    });

    // ── Notify author on publish ──────────────────────────────────────────────
    if (status === "PUBLISH") {
      const emails: string[] = [];
      if (updatedPaper.author?.email) emails.push(updatedPaper.author.email);
      if (emails.length > 0) {
        sendPaperPublicationMail({ paper: updatedPaper, recipientEmails: emails }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Paper status updated to ${status} successfully.`,
      paper: updatedPaper,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }
    console.error("publish route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
}
