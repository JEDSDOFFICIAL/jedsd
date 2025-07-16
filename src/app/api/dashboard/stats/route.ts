import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get paper statistics for dashboard
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");

    // Global statistics
    const [
      totalPapers,
      uploadedPapers,
      underReviewPapers,
      underEditPapers,
      publishedPapers,
      rejectedPapers,
      totalUsers,
      totalReviewers,
      reviewerAllocationPending,
      awaitingFinalDecision
    ] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.researchPaper.count({ where: { status: "UPLOAD" } }),
      prisma.researchPaper.count({ where: { status: "ON_REVIEW" } }),
      prisma.researchPaper.count({ where: { status: "ON_EDIT" } }),
      prisma.researchPaper.count({ where: { status: "PUBLISH" } }),
      prisma.researchPaper.count({ where: { status: "REJECTED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { userType: "REVIEWER" } }),
      prisma.researchPaper.count({ where: { status: "REVIEWER_ALLOCATION" } }),
      prisma.researchPaper.count({
        where: {
          reviewerStatus: { in: ["ACCEPTED_FOR_REVIEW", "REJECTED_FOR_REVIEW"] },
          status: {
            notIn: ["PUBLISH", "REJECTED"]
          }
        }
      })
    ]);

    let userSpecificStats = {};

    if (userId && userType) {
      switch (userType) {
        case "USER":
          const [
            authoredPapers,
            authoredPublished,
            underReview,
            underEdit,
            rejectedUserPapers
          ] = await Promise.all([
            prisma.researchPaper.count({ where: { authorId: userId } }),
            prisma.researchPaper.count({
              where: { authorId: userId, status: "PUBLISH" }
            }),
            prisma.researchPaper.count({
              where: { authorId: userId, status: "ON_REVIEW" }
            }),
            prisma.researchPaper.count({
              where: { authorId: userId, status: "ON_EDIT" }
            }),
            prisma.researchPaper.count({
              where: { authorId: userId, status: "REJECTED" }
            })
          ]);

          userSpecificStats = {
            authoredPapers,
            authoredPublished,
            underReview,
            underEdit,
            rejectedUserPapers
          };
          break;

        case "REVIEWER":
          const [
            assignedForReview,
            reviewsCompleted,
            pendingReviews,
            majorSuggested,
            minorSuggested
          ] = await Promise.all([
            prisma.paperReview.count({ where: { reviewerId: userId } }),
            prisma.paperReview.count({
              where: {
                reviewerId: userId,
                reviewerStatus: {
                  in: ["ACCEPTED_FOR_PUBLICATION", "REJECTED_FOR_PUBLICATION"]
                }
              }
            }),
            prisma.paperReview.count({
              where: {
                reviewerId: userId,
                reviewerStatus: "PENDING"
              }
            }),
            prisma.paperReview.count({
              where: {
                reviewerId: userId,
                revisionType: "MAJOR"
              }
            }),
            prisma.paperReview.count({
              where: {
                reviewerId: userId,
                revisionType: "MINOR"
              }
            })
          ]);

          userSpecificStats = {
            assignedForReview,
            reviewsCompleted,
            pendingReviews,
            majorSuggested,
            minorSuggested
          };
          break;

        case "ADMIN":
          userSpecificStats = {
            reviewerAllocationPending,
            awaitingFinalDecision
          };
          break;
      }
    }

    return NextResponse.json({
      overall: {
        totalPapers,
        uploadedPapers,
        underReviewPapers,
        underEditPapers,
        publishedPapers,
        rejectedPapers,
        totalUsers,
        totalReviewers,
        reviewerAllocationPending,

        awaitingFinalDecision
      },
      userSpecific: userSpecificStats
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
