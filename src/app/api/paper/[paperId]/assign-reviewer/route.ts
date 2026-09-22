import { NextRequest, NextResponse } from "next/server";
import { AuditAction, ReviewerStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { sendReviewerAllocationMail } from "@/helper/send_reviewer_allocation_mail";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const uuidSchema = z.string().uuid();

export async function POST(req: NextRequest, context: { params: Promise<{ paperId: string }> }) {
  try {
    const params = await context.params;
    const paperIdParam = params.paperId;
    const paperId = uuidSchema.safeParse(paperIdParam);
    if (!paperId.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid paperId format.",
        errors: paperId.error.errors
      }, { status: 400 });
    }

    const { reviewerIds, reviewRoundId } = await req.json();
    console.log("paper id is", paperId, "reviewerIds are", reviewerIds, "reviewRoundId:", reviewRoundId);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { canAssignReviewer } = await import("@/lib/permissions");
    const hasPermission = await canAssignReviewer(session.user as any);
    if (!hasPermission) {
      return NextResponse.json({ success: false, message: "Forbidden: You do not have permission to assign reviewers." }, { status: 403 });
    }

    // Validate input
    if (!paperId || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "paperId and at least one reviewerId are required" },
        { status: 400 }
      );
    }

    // Ensure paper exists
    const paper = await prisma.researchPaper.findUnique({ where: { id: paperId.data } });
    if (!paper) {
      return NextResponse.json({ success: false, message: "Paper not found" }, { status: 404 });
    }

    // Get reviewers and validate
    const foundReviewers = await prisma.user.findMany({
      where: { id: { in: reviewerIds } }
    });

    // Accumulated list — starts from DB result, may grow via push() below
    // eslint-disable-next-line prefer-const
    let reviewers = [...foundReviewers];

    // If some reviewers were not found directly by User.id, check if any reviewerIds are UserDetails.id
    if (reviewers.length !== reviewerIds.length) {
      const foundUserIds = new Set(reviewers.map(r => r.id));
      const missingIds = reviewerIds.filter((id: string) => !foundUserIds.has(id));

      const details = await prisma.userDetails.findMany({
        where: { id: { in: missingIds } }
      });

      if (details.length > 0) {
        const detailEmails = details.map(d => d.email);
        const usersFromDetails = await prisma.user.findMany({
          where: { email: { in: detailEmails } }
        });

        for (const u of usersFromDetails) {
          if (!foundUserIds.has(u.id)) {
            reviewers.push(u);
            foundUserIds.add(u.id);
          }
        }
      }
    }

    if (reviewers.length !== reviewerIds.length) {
      const foundIds = reviewers.map(r => r.id);
      const invalidIds = reviewerIds.filter((id: string) => !foundIds.includes(id));
      return NextResponse.json(
        { success: false, message: "One or more reviewers are invalid or not registered", invalidIds },
        { status: 400 }
      );
    }

    const resolvedReviewerIds = reviewers.map(r => r.id);

    // Validate reviewRoundId if provided
    if (reviewRoundId) {
      const round = await prisma.reviewRound.findUnique({ where: { id: reviewRoundId } });
      if (!round || round.paperId !== paperId.data) {
        return NextResponse.json({ success: false, message: "Invalid reviewRoundId for this paper." }, { status: 400 });
      }
    }

    // Check for existing reviews in the specific round (prevent duplicate assignments in same round)
    const existingReviews = await prisma.paperReview.findMany({
      where: {
        paperId: paperId.data,
        reviewerId: { in: resolvedReviewerIds },
        reviewRoundId: reviewRoundId || null,
      }
    });

    if (existingReviews.length > 0) {
      const existingReviewerIds = existingReviews.map(r => r.reviewerId);
      return NextResponse.json(
        {
          success: false,
          message: "Some reviewers are already assigned to this paper",
          existingReviewers: existingReviewerIds
        },
        { status: 400 }
      );
    }

    // Create PaperReview entries
    const paperReviews = await Promise.all(
      resolvedReviewerIds.map((rid: string) =>
        prisma.paperReview.create({
          data: {
            paperId: paperId.data,
            reviewerId: rid,
            reviewText: "",
            reviewerStatus: ReviewerStatus.PENDING,
            ...(reviewRoundId ? { reviewRoundId } : {}),
          }
        })
      )
    );

    // Audit log for each assignment
    if (session?.user?.id) {
      await prisma.manuscriptAuditLog.create({
        data: {
          paperId: paperId.data,
          userId: session.user.id,
          action: AuditAction.EDITOR_ASSIGNED_REVIEWER,
          metadata: { reviewerIds: resolvedReviewerIds, reviewRoundId: reviewRoundId ?? null },
        },
      }).catch(() => {});
    }

    // Send emails to reviewers (non-blocking)
    const emailResults = await Promise.allSettled(
      reviewers.map(async (reviewer) => {
        try {
          const emailRes = await sendReviewerAllocationMail({
            paper,
            reviewerName: reviewer.name as string,
            revieweremail: reviewer.email as string
          });
          return { success: true, reviewerId: reviewer.id, result: emailRes };
        } catch (error) {
          console.error(`Failed to send email to reviewer ${reviewer.id}:`, error);
          return { success: false, reviewerId: reviewer.id, error };
        }
      })
    );

    // Update paper status to ON_REVIEW
    await prisma.researchPaper.update({
      where: { id: paperId.data },
      data: { status: "ON_REVIEW" }
    });

    const failedEmails = emailResults.filter(r =>
      r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    );
    const successfulEmails = emailResults.length - failedEmails.length;

    return NextResponse.json({
      success: true,
      message: "Reviewers assigned successfully",
      data: paperReviews,
      emailStatus: {
        sent: successfulEmails,
        failed: failedEmails.length,
        total: reviewers.length
      }
    });

  } catch (error: any) {
    console.error("Error assigning reviewers:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
