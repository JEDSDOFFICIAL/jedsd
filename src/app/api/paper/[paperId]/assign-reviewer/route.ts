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
    let reviewers = await prisma.user.findMany({
      where: { id: { in: reviewerIds } }
    });

    // If some reviewers were not found directly by User.id, check if any reviewerIds are UserDetails.id
    if (reviewers.length !== reviewerIds.length) {
      const foundUserIds = new Set(reviewers.map(r => r.id));
      const missingIds = reviewerIds.filter(id => !foundUserIds.has(id));

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
      const invalidIds = reviewerIds.filter(id => !foundIds.includes(id));
      console.error("One or more reviewers are invalid:", invalidIds);
      return NextResponse.json(
        { success: false, message: "One or more reviewers are invalid or not registered", invalidIds },
        { status: 400 }
      );
    }

    const resolvedReviewerIds = reviewers.map(r => r.id);

    // Check for existing reviews (more comprehensive check)
    const existingReviews = await prisma.paperReview.findMany({
      where: {
        paperId: paperId.data,
        reviewerId: { in: resolvedReviewerIds }
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
      resolvedReviewerIds.map((rid) =>
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

    // Send emails to reviewers (using resolved reviewer records)
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