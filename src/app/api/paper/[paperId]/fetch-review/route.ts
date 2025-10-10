// app/api/reviews/[paperId]/fetch-reviews/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const uuidSchema = z.string().uuid("Invalid UUID format.");

// GET /api/reviews/[paperId]/fetch-reviews?reviewerId=optional
export async function GET(
  req: Request,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    const paperId = await context.params.then((p) => p.paperId);
    console.log("Fetching reviews for paperId:", paperId);
    

    // Validate paperId
    const paperIdResult = uuidSchema.safeParse(paperId);
    if (!paperIdResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid paper ID provided.", errors: paperIdResult.error.errors },
        { status: 400 }
      );
    }

    // Extract reviewerId from query string and validate if present
    const { searchParams } = new URL(req.url);
    const reviewerId = searchParams.get("reviewerId");

    if (reviewerId) {
      const reviewerIdResult = uuidSchema.safeParse(reviewerId);
      if (!reviewerIdResult.success) {
        return NextResponse.json(
          { success: false, message: "Invalid reviewer ID provided.", errors: reviewerIdResult.error.errors },
          { status: 400 }
        );
      }
    }

    // Build query filter
    const where: any = { paperId: paperIdResult.data };
    if (reviewerId) where.reviewerId = reviewerId;

    // Fetch reviews (also wrapped in Promise)
    const paperReviews = await Promise.resolve(
      prisma.paperReview.findMany({
        where,
        include: {
          reviewer: { select: { id: true, name: true, email: true, userType: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: paperReviews.length
          ? "Reviews fetched successfully."
          : "No reviews found for this paper.",
        reviews: paperReviews,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching paper reviews:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error in fetch-reviews", error: error.message },
      { status: 500 }
    );
  }
}
