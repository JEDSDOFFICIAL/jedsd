import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotificationService } from "@/helper/mail";
import { ReviewerStatus, PaperStatus } from "@prisma/client";

const reviewerActionSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
  action: z.enum(["ACCEPT_REVIEW", "REJECT_REVIEW", "ACCEPT_PUBLICATION", "REJECT_PUBLICATION"]),
  reviewText: z.string().optional(),
  rating: z.number().min(1).max(10).optional(),
  correspondingFile: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== "REVIEWER") {
      return NextResponse.json(
        { error: "Unauthorized. Only reviewers can perform this action." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = reviewerActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { paperId, action, reviewText, rating, correspondingFile } = parsed.data;

    // Find the paper and verify reviewer assignment
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: true,
        reviewer: true,
      },
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    if (paper.reviewerId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not assigned as the reviewer for this paper" },
        { status: 403 }
      );
    }

    // Map action to reviewer status
    const statusMap = {
      ACCEPT_REVIEW: ReviewerStatus.ACCEPTED_FOR_REVIEW,
      REJECT_REVIEW: ReviewerStatus.REJECTED_FOR_REVIEW,
      ACCEPT_PUBLICATION: ReviewerStatus.ACCEPTED_FOR_PUBLICATION,
      REJECT_PUBLICATION: ReviewerStatus.REJECTED_FOR_PUBLICATION,
    };

    const reviewerStatus = statusMap[action];
    
    // Determine new paper status
    let newPaperStatus = paper.status;
    if (action === "ACCEPT_REVIEW") {
      newPaperStatus = PaperStatus.ON_REVIEW;
    } else if (action === "REJECT_REVIEW") {
      newPaperStatus = PaperStatus.REVIEWER_ALLOCATION;
    } else if (action === "ACCEPT_PUBLICATION") {
      newPaperStatus = PaperStatus.EDITOR_ALLOCATION;
    } else if (action === "REJECT_PUBLICATION") {
      newPaperStatus = PaperStatus.REJECTED;
    }

    // Create review record
    await prisma.paperReview.create({
      data: {
        paperId,
        reviewerId: session.user.id,
        reviewText: reviewText || "",
        rating,
        correspondingFile,
        reviewerStatus,
      },
    });

    // Update paper status and reviewer status
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        status: newPaperStatus,
        reviewerStatus,
      },
      include: {
        author: true,
        reviewer: true,
      },
    });

    // Send notifications
    if (paper.reviewer) {
      await NotificationService.sendReviewerStatusNotifications(
        updatedPaper,
        paper.reviewer,
        reviewerStatus.toString(),
        reviewText,
        rating
      );
    }

    // Send status update notifications if paper status changed
    if (newPaperStatus !== paper.status) {
      await NotificationService.sendPaperStatusUpdateNotifications(
        updatedPaper,
        newPaperStatus.toString(),
        `Reviewer ${action.toLowerCase().replace('_', ' ')}: ${reviewText || 'No additional comments'}`
      );
    }

    return NextResponse.json({
      message: `Review ${action.toLowerCase().replace('_', ' ')} successfully`,
      paper: updatedPaper,
    });

  } catch (error) {
    console.error("Reviewer action error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
