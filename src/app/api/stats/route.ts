// app/api/dashboard-stats/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, UserType, PaperStatus, ReviewerStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for validating query parameters
const dashboardStatsQuerySchema = z.object({
  userId: z.string().uuid("Invalid user ID format.").optional(), // Optional, as admin might not need it
  userType: z.nativeEnum(UserType, {
    errorMap: () => ({ message: "Invalid user type." }),
  }),
});

// GET /api/dashboard-stats - Fetches dashboard statistics based on user type
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract and validate query parameters
    const queryParams = {
      userId: searchParams.get("userId") || undefined, // Use undefined if not present
      userType: searchParams.get("userType"),
    };

    const validationResult = dashboardStatsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters.", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { userId, userType } = validationResult.data;

    // Ensure userId is provided for non-admin roles
    if (userType !== UserType.ADMIN && !userId) {
      return NextResponse.json(
        { success: false, message: "userId is required for this user type." },
        { status: 400 }
      );
    }

    let stats: any = {};

    switch (userType) {
      case UserType.AUTHOR: // Stats for Authors
        // Check if the user exists
        const author = await prisma.user.findUnique({ where: { id: userId } });
        if (!author) {
          return NextResponse.json(
            { success: false, message: "Author not found." },
            { status: 404 }
          );
        }

        const authoredPapers = await prisma.researchPaper.findMany({
          where: { authorId: userId },
        });

        stats = {
          totalAuthoredPapers: authoredPapers.length,
          papersInReview: authoredPapers.filter(
            (p) => p.status === PaperStatus.ON_REVIEW
          ).length,
          papersAccepted: authoredPapers.filter(
            (p) => p.status === PaperStatus.ACCEPTED
          ).length,
          papersRejected: authoredPapers.filter(
            (p) => p.status === PaperStatus.REJECTED
          ).length,
          papersPublished: authoredPapers.filter(
            (p) => p.status === PaperStatus.PUBLISH
          ).length,
        };
        break;

      case UserType.REVIEWER: // Stats for Reviewers
        // Check if the user exists and is currently acting as a reviewer
        const reviewer = await prisma.user.findUnique({ where: { id: userId } });
        const effectiveReviewerType = reviewer?.variableUserType || reviewer?.userType;
        if (!reviewer || effectiveReviewerType !== UserType.REVIEWER) {
          return NextResponse.json(
            { success: false, message: "Reviewer not found or not currently authorized as reviewer." },
            { status: 404 }
          );
        }

        const reviewerReviews = await prisma.paperReview.findMany({
          where: { reviewerId: userId },
          select: { rating: true, reviewerStatus: true },
        });

        const submittedReviews = reviewerReviews.filter(
          (r) => r.reviewerStatus === ReviewerStatus.ACCEPTED_FOR_REVIEW ||
                 r.reviewerStatus === ReviewerStatus.REJECTED_FOR_PUBLICATION
        ).length;

        const pendingReviews = reviewerReviews.filter(
          (r) => r.reviewerStatus === ReviewerStatus.PENDING
        ).length;

        const ratings = reviewerReviews
          .filter((r) => r.rating !== null)
          .map((r) => r.rating!); // Filter out null ratings and assert non-null

        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        stats = {
          totalAssignedReviews: reviewerReviews.length,
          reviewsSubmitted: submittedReviews,
          reviewsPending: pendingReviews,
          averageRatingGiven: parseFloat(averageRating.toFixed(2)), // Format to 2 decimal places
        };
        break;

      case UserType.EDITOR: // Stats for Editors
        // Check if the user exists and is currently acting as an editor
        const editor = await prisma.user.findUnique({ where: { id: userId } });
        const effectiveEditorType = editor?.variableUserType || editor?.userType;
        if (!editor || effectiveEditorType !== UserType.EDITOR) {
          return NextResponse.json(
            { success: false, message: "Editor not found or not currently authorized as editor." },
            { status: 404 }
          );
        }

        // Get papers assigned to this editor for allocation
        const papersToAllocate = await prisma.researchPaper.count({
          where: { status: PaperStatus.REVIEWER_ALLOCATION },
        });

        const papersInReview = await prisma.researchPaper.count({
          where: { status: PaperStatus.ON_REVIEW },
        });

        const papersCompleted = await prisma.researchPaper.count({
          where: { 
            status: { 
              in: [PaperStatus.ACCEPTED, PaperStatus.REJECTED, PaperStatus.PUBLISH] 
            } 
          },
        });

        const totalPapersManaged = await prisma.researchPaper.count();

        stats = {
          papersToAllocate,
          papersInReview,
          papersCompleted,
          totalPapersManaged,
        };
        break;

      case UserType.ADMIN: // Stats for Admin
        const totalUsers = await prisma.user.count();
        const totalResearchPapers = await prisma.researchPaper.count();
        const totalReviews = await prisma.paperReview.count();
        const totalReviewers = await prisma.user.count({
          where: { userType: UserType.REVIEWER }
        });

        // Count papers by each status
        const papersByStatus: Record<PaperStatus, number> = {} as Record<PaperStatus, number>;
        for (const status of Object.values(PaperStatus) as PaperStatus[]) {
          papersByStatus[status] = await prisma.researchPaper.count({
            where: { status: status },
          });
        }

        // Calculate overall average review rating
        const overallAverageRatingResult = await prisma.paperReview.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            rating: {
              not: null,
            },
          },
        });

        stats = {
          totalUsers,
          totalResearchPapers,
          totalReviewers,
          papersByStatus,
          totalReviews,
          averageOverallReviewRating: overallAverageRatingResult._avg.rating
            ? parseFloat(overallAverageRatingResult._avg.rating.toFixed(2))
            : 0,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Unsupported user type for dashboard stats." },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Dashboard statistics fetched successfully.",
      userType,
      stats: {
        userSpecific: userType === UserType.ADMIN ? {} : stats,
        overall: userType === UserType.ADMIN ? stats : {}
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error in dashboard stats API.", error: error.message },
      { status: 500 }
    );
  }
}
