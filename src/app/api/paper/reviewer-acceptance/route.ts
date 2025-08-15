// app/api/reviews/route.ts (or pages/api/reviews.ts if using Pages Router)

import { NextResponse } from "next/server";
import { PrismaClient, ReviewerStatus, UserType } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// --- Zod Schemas for Request Validation ---

// Schema for PATCH request to update a review's status
const patchReviewSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  reviewerId: z.string().uuid("Invalid reviewerId format."),
  status: z.nativeEnum(ReviewerStatus, {
    errorMap: () => ({ message: "Invalid reviewer status." }),
  }),
});

// Schema for GET request (query parameters)
const getReviewsSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
});

// Schema for POST request to reassign a reviewer
const postReassignReviewerSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  rejectedReviewerId: z.string().uuid("Invalid rejectedReviewerId format."),
  newReviewerId: z.string().uuid("Invalid newReviewerId format."),
});

// --- API Route Handlers ---

// PATCH /api/reviews - Update a reviewer's decision for a specific paper like accept/reject for review or publication
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log("Received PATCH request with body:", body);
    const validationResult = patchReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data.", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { paperId, reviewerId, status } = validationResult.data;

    const paperReview = await prisma.paperReview.findFirst({
      where: { paperId, reviewerId },
    });

    if (!paperReview) {
      return NextResponse.json(
        { success: false, message: "Review record not found for given paperId and reviewerId" },
        { status: 404 }
      );
    }

    const updatedReview = await prisma.paperReview.update({
      where: { id: paperReview.id },
      data: { reviewerStatus: status },
    });

    return NextResponse.json({
      success: true,
      message: "Reviewer decision updated successfully",
      updatedReview,
    });

  } catch (error: any) {
    console.error("Error updating reviewer decision:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}


// POST /api/reviews - Reassign a reviewer (delete old, create new)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = postReassignReviewerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data.", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { paperId, rejectedReviewerId, newReviewerId } = validationResult.data;

    const rejectedReview = await prisma.paperReview.findFirst({
      where: {
        paperId,
        reviewerId: rejectedReviewerId,
        reviewerStatus: ReviewerStatus.REJECTED_FOR_REVIEW,
      },
    });

    if (!rejectedReview) {
      return NextResponse.json(
        { success: false, message: "No rejected review found for the given reviewer" },
        { status: 404 }
      );
    }

    await prisma.paperReview.delete({
      where: { id: rejectedReview.id },
    });

    const newReviewer = await prisma.user.findUnique({
      where: { id: newReviewerId },
    });

    if (!newReviewer || newReviewer.userType !== UserType.REVIEWER) {
      return NextResponse.json(
        { success: false, message: "Invalid new reviewer or user is not a REVIEWER" },
        { status: 400 }
      );
    }

    const reassignedReview = await prisma.paperReview.create({
      data: {
        paperId,
        reviewerId: newReviewerId,
        reviewText: "",
        reviewerStatus: ReviewerStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reviewer reassigned successfully",
      reassignedReview,
    });

  } catch (error: any) {
    console.error("Error reassigning reviewer:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
