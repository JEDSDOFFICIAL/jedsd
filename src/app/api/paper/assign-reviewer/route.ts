import { NextResponse } from "next/server";
import {  ReviewerStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { paperId, reviewerIds } = await req.json();
    console.log("paper id is ",paperId,"reviewerIds are",reviewerIds);

    if (!paperId || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      console.error("Invalid request data:", { paperId, reviewerIds });
      return NextResponse.json(
        { success: false, message: "paperId and at least one reviewerId are required" },
        { status: 400 }
      );
    }

    // Ensure paper exists
    const paper = await prisma.researchPaper.findUnique({ where: { id: paperId } });
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

    const findExistingPaperReview = await prisma.paperReview.findFirst({
      where: {
        paperId,
        reviewerId: { in: reviewerIds }
      }
    });

    if (findExistingPaperReview) {
      console.error("Paper review already exists:", findExistingPaperReview);
      return NextResponse.json(
        { success: false, message: "Paper review already exists" },
        { status: 400 }
      );
    }


    // Create PaperReview entries
    const paperReviews = await Promise.all(
      reviewerIds.map((rid) =>
        prisma.paperReview.create({
          data: {
            paperId,
            reviewerId: rid,
            reviewText: "",
            reviewerStatus: ReviewerStatus.PENDING
          }
        })
      )
    );

    // Update paper status
    await prisma.researchPaper.update({
      where: { id: paperId },
      data: { status: "ON_REVIEW" }
    });

    return NextResponse.json({
      success: true,
      message: "Reviewers assigned successfully",
      data: paperReviews
    });

  } catch (error: any) {
    console.error("Error assigning reviewers:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
