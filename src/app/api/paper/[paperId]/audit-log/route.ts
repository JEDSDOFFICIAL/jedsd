/**
 * GET /api/paper/[paperId]/audit-log
 *
 * Returns the immutable audit trail for a paper.
 * Role: EDITOR or ADMIN only. Authors and reviewers do NOT have access to the audit log.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    if (!user || (user.variableUserType !== "EDITOR" && user.variableUserType !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Forbidden: Editor or Admin required." }, { status: 403 });
    }

    const { paperId } = await context.params;
    const paper = await prisma.researchPaper.findFirst({
      where: { OR: [{ id: paperId }, { paperId }] },
    });
    if (!paper) return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });

    const logs = await prisma.manuscriptAuditLog.findMany({
      where: { paperId: paper.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true, userType: true } },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("audit-log GET error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
