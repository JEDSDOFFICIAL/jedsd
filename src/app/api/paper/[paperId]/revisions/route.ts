/**
 * GET /api/paper/[paperId]/revisions
 *
 * Returns all revisions for a paper, with their files, filtered by access level.
 *
 * Access rules:
 *   ADMIN / EDITOR             → sees all files
 *   AUTHOR (own paper)         → sees AUTHOR_EDITOR files; NOT EDITOR_ONLY files
 *   REVIEWER (assigned)        → sees only files where accessLevel = REVIEWER_ASSIGNED
 *                                 and only for revisions where visibleToReviewers = true
 *   Others                     → 403
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FileAccessLevel } from "@prisma/client";

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

    // Find paper by UUID or human-readable paperId
    const paper = await prisma.researchPaper.findFirst({
      where: { OR: [{ id: paperId }, { paperId }] },
    });
    if (!paper) return NextResponse.json({ success: false, message: "Paper not found." }, { status: 404 });

    const role = user.variableUserType;
    const isEditorOrAdmin = role === "EDITOR" || role === "ADMIN";
    const isOwnAuthor = paper.authorId === user.id;

    // Check reviewer assignment
    const isAssignedReviewer =
      role === "REVIEWER"
        ? !!(await prisma.paperReview.findFirst({ where: { paperId: paper.id, reviewerId: user.id } }))
        : false;

    if (!isEditorOrAdmin && !isOwnAuthor && !isAssignedReviewer) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    // Fetch all revisions
    const revisions = await prisma.manuscriptRevision.findMany({
      where: { paperId: paper.id },
      orderBy: { revisionNumber: "asc" },
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
        triggeredByRound: { select: { id: true, roundNumber: true } },
        files: {
          orderBy: { uploadedAt: "asc" },
        },
      },
    });

    // Apply access-level filtering per role
    const filtered = revisions.map((rev) => {
      let files = rev.files;

      if (isEditorOrAdmin) {
        // Editor/Admin sees everything
      } else if (isOwnAuthor) {
        // Author sees AUTHOR_EDITOR files only (not EDITOR_ONLY)
        files = files.filter(
          (f) => f.accessLevel === FileAccessLevel.AUTHOR_EDITOR || f.accessLevel === FileAccessLevel.PUBLIC
        );
      } else if (isAssignedReviewer) {
        // Reviewer only sees files from revisions that are explicitly visible + REVIEWER_ASSIGNED files
        if (!rev.visibleToReviewers) return null; // Skip hidden revisions
        files = files.filter((f) => f.accessLevel === FileAccessLevel.REVIEWER_ASSIGNED);
      }

      return { ...rev, files };
    }).filter(Boolean);

    // Also audit: editor viewed revision
    if (isEditorOrAdmin && revisions.length > 0) {
      await prisma.manuscriptAuditLog.create({
        data: {
          paperId: paper.id,
          userId: user.id,
          action: "EDITOR_VIEWED_REVISION",
          metadata: { revisionsCount: revisions.length },
        },
      }).catch(() => {}); // Non-blocking
    }

    return NextResponse.json({
      success: true,
      revisions: filtered,
    });
  } catch (error: any) {
    console.error("revisions GET error:", error);
    return NextResponse.json({ success: false, message: "Server error.", error: error.message }, { status: 500 });
  }
}
