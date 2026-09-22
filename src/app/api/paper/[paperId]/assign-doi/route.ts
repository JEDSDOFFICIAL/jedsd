/**
 * PATCH /api/paper/[paperId]/assign-doi
 *
 * Assigns a DOI to an accepted paper.
 *
 * SECURITY: Only ADMIN or users with canPublish = true.
 *   Normal EDITOR, REVIEWER, AUTHOR → 403 Forbidden.
 *
 * Body: { doi: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

const bodySchema = z.object({
  doi: z.string().min(3, "DOI must be at least 3 characters."),
});

export async function PATCH(
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

    const { canAssignDOI } = await import("@/lib/permissions");
    const hasPermission = await canAssignDOI(session.user as any);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Admin or authorized Publication Editor can assign a DOI." },
        { status: 403 }
      );
    }

    const { paperId } = await context.params;
    const paper = await prisma.researchPaper.findUnique({ where: { id: paperId } });
    if (!paper) {
      return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });
    }

    // Paper must be ACCEPTED or PUBLISH
    if (paper.status !== "ACCEPTED" && paper.status !== "PUBLISH") {
      return NextResponse.json(
        { success: false, message: "DOI can only be assigned to ACCEPTED or PUBLISHED papers." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid DOI.", errors: parsed.error.errors }, { status: 400 });
    }

    const { doi } = parsed.data;

    // Check DOI uniqueness
    const existing = await prisma.researchPaper.findUnique({ where: { doi } });
    if (existing && existing.id !== paper.id) {
      return NextResponse.json({ success: false, message: "This DOI is already assigned to another paper." }, { status: 409 });
    }

    const updatedPaper = await prisma.$transaction(async (tx) => {
      const updated = await tx.researchPaper.update({
        where: { id: paper.id },
        data: { doi },
      });

      await tx.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: AuditAction.AUTHORIZED_USER_ASSIGNED_DOI,
          metadata: { doi, assignedBy: user.email },
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "DOI assigned successfully.",
      doi: updatedPaper.doi,
      paperId: updatedPaper.paperId,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, message: "This DOI is already in use." }, { status: 409 });
    }
    console.error("assign-doi error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
