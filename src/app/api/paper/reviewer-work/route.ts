// app/api/upload-review/route.ts (or pages/api/upload-review.ts if using Pages Router)

import { NextResponse } from "next/server";
import { PrismaClient, ReviewerStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod Schema for the review upload request body
const uploadReviewSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  reviewerId: z.string().uuid("Invalid reviewerId format."),
  reviewText: z.string().min(1, "Review text cannot be empty."),
  correspondingFile: z.string().url("Invalid file URL format.").optional(), // Assuming a URL for the file
  rating: z.number().int().min(1).max(5).optional(), // Assuming a rating from 1 to 5
});

// POST handler for uploading a review
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = uploadReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data.", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { paperId, reviewerId, reviewText, correspondingFile, rating } = validationResult.data;

    // Verify if the paper and reviewer exist and are linked for review
    const existingPaperReview = await prisma.paperReview.findFirst({
      where: {
        paperId: paperId,
        reviewerId: reviewerId,
      },
      // You might want to also check if the paper is in a state where reviews are expected (e.g., ON_REVIEW)
       include: { paper: true }
    });

    if (!existingPaperReview) {
      // If there's no existing assignment for this reviewer to this paper,
      // you might want to create a new one or return an error depending on your business logic.
      // For this API, we assume the assignment (PaperReview entry) already exists and we're updating it.
      // If you want to allow creating new reviews here, adjust the logic.
      return NextResponse.json(
        { success: false, message: "No existing review assignment found for this paper and reviewer." },
        { status: 404 }
      );
    }

    // Update the existing PaperReview record with the new review details
    const uploadedReview = await prisma.paperReview.update({
      where: { id: existingPaperReview.id },
      data: {
        reviewText: reviewText,
        correspondingFile: correspondingFile,
        rating: rating,
        reviewerStatus: ReviewerStatus.ACCEPTED_FOR_REVIEW, // Or another appropriate status after review submission
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review uploaded successfully.",
      review: uploadedReview,
    });

  } catch (error: any) {
    console.error("Error uploading review:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
