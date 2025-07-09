import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaperStatus, ReviewerStatus } from "@prisma/client";
import { NotificationService } from "@/helper/mail";

export async function POST(req: NextRequest) {
  try {
    const { paperId, reviewerId } = await req.json();

    if (!paperId || !reviewerId) {
      return NextResponse.json(
        { error: "Paper ID and Reviewer ID are required" },
        { status: 400 }
      );
    }

    // Check if paper exists
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: { select: { name: true, email: true } }
      }
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    // Check if reviewer exists and has REVIEWER role
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer || reviewer.userType !== "REVIEWER") {
      return NextResponse.json(
        { error: "Invalid reviewer or user is not a reviewer" },
        { status: 400 }
      );
    }

    // Update paper with reviewer and change status
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        reviewerId: reviewerId,
        status: PaperStatus.REVIEWER_ALLOCATION,
        reviewerStatus: ReviewerStatus.PENDING
      },
      include: {
        author: true,
        reviewer: true
      }
    });

    // Send email notifications to all relevant parties
    await NotificationService.sendReviewerAssignmentNotifications(updatedPaper, reviewer);

    return NextResponse.json({
      message: "Reviewer assigned successfully",
      paper: updatedPaper
    });

  } catch (error) {
    console.error("Error assigning reviewer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
