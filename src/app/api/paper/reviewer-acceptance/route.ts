// app/api/reviews/route.ts (or pages/api/reviews.ts if using Pages Router)

import { NextRequest, NextResponse } from "next/server";
import {  ReviewerStatus, UserType } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendReviewerAcceptanceMail } from "@/helper/send_reviewer_acceptance_mail";


const patchReviewSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  reviewerId: z.string().uuid("Invalid reviewerId format."),
  status: z.nativeEnum(ReviewerStatus, {
    errorMap: () => ({ message: "Invalid reviewer status." }),
  }),
});

const postReassignReviewerSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  rejectedReviewerId: z.string().uuid("Invalid rejectedReviewerId format."),
  newReviewerId: z.string().uuid("Invalid newReviewerId format."),
});

export async function PATCH(req: NextRequest) {
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
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
    });
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
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
    const EmailSendToEditor = await sendReviewerAcceptanceMail({paperTitle:paper?.title || 'Untitled Paper', reviewerName: reviewer?.name || 'Reviewer', acceptanceStatus: status})
    console.log("Email sent to editor:", EmailSendToEditor);
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

    // Check if the user exists and has REVIEWER role (either as base role or switched role)
    const effectiveUserType = newReviewer?.variableUserType || newReviewer?.userType;
    if (!newReviewer || effectiveUserType !== UserType.REVIEWER) {
      return NextResponse.json(
        { success: false, message: "Invalid new reviewer or user is not currently acting as a REVIEWER" },
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
