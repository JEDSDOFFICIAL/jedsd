import { NextRequest, NextResponse } from "next/server";
import { ReviewerStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { sendReviewerAllocationMail } from "@/helper/send_reviewer_allocation_mail";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function POST(req: NextRequest,context: { params: Promise<{ paperId: string }> }) {
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

    const { reviewerIds } = await req.json();
    console.log("paper id is", paperId, "reviewerIds are", reviewerIds);

    // Validate input
    if (!paperId || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      console.error("Invalid request data:", { paperId, reviewerIds });
      return NextResponse.json(
        { success: false, message: "paperId and at least one reviewerId are required" },
        { status: 400 }
      );
    }
    console.log("Validated paperId:", paperId.data);
    // Ensure paper exists
    const paper = await prisma.researchPaper.findUnique({ where: { id: paperId.data } });
    if (!paper) {
      console.error("Paper not found for ID:", paperId);
      return NextResponse.json({ success: false, message: "Paper not found" }, { status: 404 });
    }

    // Get reviewers and validate
    const reviewers = await prisma.user.findMany({
      where: { id: { in: reviewerIds } }
    });

    if (reviewers.length !== reviewerIds.length) {
      console.error("One or more reviewers are invalid:", reviewerIds);
      return NextResponse.json(
        { success: false, message: "One or more reviewers are invalid" },
        { status: 400 }
      );
    }

    // Check for existing reviews (more comprehensive check)
    const existingReviews = await prisma.paperReview.findMany({
      where: {
        paperId: paperId.data,
        reviewerId: { in: reviewerIds }
      }
    });

    if (existingReviews.length > 0) {
      const existingReviewerIds = existingReviews.map(r => r.reviewerId);
      console.error("Paper review already exists for reviewers:", existingReviewerIds);
      return NextResponse.json(
        { 
          success: false, 
          message: `Some reviewers are already assigned to this paper`,
          existingReviewers: existingReviewerIds
        },
        { status: 400 }
      );
    }

    // Create PaperReview entries
    const paperReviews = await Promise.all(
      reviewerIds.map((rid) =>
        prisma.paperReview.create({
          data: {
            paperId: paperId.data,
            reviewerId: rid,
            reviewText: "",
            reviewerStatus: ReviewerStatus.PENDING
          }
        })
      )
    );

    // Send emails to reviewers (using existing reviewer data to avoid extra queries)
    const reviewerMap = new Map(reviewers.map(r => [r.id, r]));
    
    const emailResults = await Promise.allSettled(
      reviewerIds.map(async (rid) => {
        const reviewer = reviewerMap.get(rid);
        if (!reviewer) {
          console.error(`Reviewer not found in map: ${rid}`);
          return { success: false, reviewerId: rid, error: 'Reviewer not found' };
        }

        try {
          const emailRes = await sendReviewerAllocationMail({
            paper,
            reviewerName: reviewer.name as string,
            revieweremail: reviewer.email as string
          });
          return { success: true, reviewerId: rid, result: emailRes };
        } catch (error) {
          console.error(`Failed to send email to reviewer ${rid}:`, error);
          return { success: false, reviewerId: rid, error };
        }
      })
    );

    // Log email failures (but don't block the response)
    const failedEmails = emailResults.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.success)
    );
    
    if (failedEmails.length > 0) {
      console.warn('Some emails failed to send:', failedEmails);
    }

    // Update paper status to ON_REVIEW
    await prisma.researchPaper.update({
      where: { id: paperId.data },
      data: { status: "ON_REVIEW" }
    });

    const successfulEmails = emailResults.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    return NextResponse.json({
      success: true,
      message: "Reviewers assigned successfully",
      data: paperReviews,
      emailStatus: {
        sent: successfulEmails,
        failed: failedEmails.length,
        total: reviewerIds.length
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