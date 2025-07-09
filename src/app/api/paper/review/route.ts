import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      paperId,
      reviewText,
      correspondingFile,
      rating,
      reviewerStatus,
      editorStatus,
      reviewerId,
      editorId,
    } = body;

    // Validate essential fields
    if (!paperId || !reviewText) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Find the research paper to ensure it exists
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json({ message: "Paper not found." }, { status: 404 });
    }

    // Update the research paper's assigned reviewer/editor if they are provided
    if (reviewerId) {
      const reviewer = await prisma.user.findUnique({
        where: { id: reviewerId },
      });
      if (!reviewer) {
        return NextResponse.json({ message: "Reviewer not found." }, { status: 404 });
      }
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { reviewerId: reviewer.id },
      });
    }

    if (editorId) {
      const editor = await prisma.user.findUnique({
        where: { id: editorId },
      });
      if (!editor) {
        return NextResponse.json({ message: "Editor not found." }, { status: 404 });
      }
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { editorId: editor.id },
      });
    }

    // Update the paper's rating if it's provided and not undefined
    if (rating !== undefined && rating !== null) {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { rating: rating },
      });
    }

    // Create the review record
    const review = await prisma.paperReview.create({
      data: {
        paperId,
        reviewText,
        correspondingFile: correspondingFile || null,
        rating: rating,
        reviewerId: reviewerId || null,
        editorId: editorId || null,
        reviewerStatus: reviewerStatus || null,
        editorStatus: editorStatus || null,
      },
      include: {
        paper: {
          select: {
            id: true,
            title: true,
            status: true,
            reviewerId: true,
            editorId: true,
            rating: true,
          },
        },
      },
    });

    // Update the paper's status based on the review decision
    if (reviewerStatus === "ACCEPTED_FOR_PUBLICATION") {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { status: "EDITOR_ALLOCATION", reviewerStatus: "ACCEPTED_FOR_PUBLICATION" },
      });
    } else if (reviewerStatus === "REJECTED_FOR_PUBLICATION") {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { status: "REJECTED", reviewerStatus: "REJECTED_FOR_PUBLICATION" },
      });
    } else if (editorStatus === "ACCEPTED_FOR_PUBLICATION") {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { status: "ACCEPTED", editorStatus: "ACCEPTED_FOR_PUBLICATION" },
      });
    } else if (editorStatus === "REJECTED_FOR_PUBLICATION") {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { status: "REJECTED", editorStatus: "REJECTED_FOR_PUBLICATION" },
      });
    }

    return NextResponse.json({ message: "Review submitted successfully", review }, { status: 201 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ message: "Internal server error", error: {} }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paperId = searchParams.get("paperId");
    const reviewerId = searchParams.get("reviewerId");
    const editorId = searchParams.get("editorId");

    const where: any = {};
    if (paperId) where.paperId = paperId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (editorId) where.editorId = editorId;

    const data = await prisma.paperReview.findMany({
      where,
      include: {
        paper: {
          select: {
            id: true,
            title: true,
            status: true,
            reviewerId: true,
            editorId: true,
            rating: true,
          },
        },
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { reviewId } = await req.json();
    
    if (reviewId) {
      await prisma.paperReview.delete({
        where: { id: reviewId }
      });
      return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 });
    } else {
      await prisma.paperReview.deleteMany();
      return NextResponse.json({ message: "All reviews deleted successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
  }
}
