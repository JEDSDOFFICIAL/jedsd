import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReviewerStatus, PaperStatus } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Zod Schema for review submission
const reviewSubmissionSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  reviewerId: z.string().uuid("Invalid reviewerId format."),
  reviewText: z.string().min(10, "Review text must be at least 10 characters."),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5."),
  correspondingFile: z.string().url().optional(),
  reviewerStatus: z.enum([
    "ACCEPTED_FOR_PUBLICATION", 
    "REJECTED_FOR_PUBLICATION",
    "ACCEPTED_FOR_REVIEW",
    "REJECTED_FOR_REVIEW",
    "PENDING"
  ]).optional(),
});

// POST handler for submitting/publishing a review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = reviewSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request data.", 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { 
      paperId, 
      reviewerId, 
      reviewText, 
      rating, 
      correspondingFile, 
      reviewerStatus
    } = validationResult.data;

    // Verify the user has permission to submit this review
    const userType = session.user.userType;
    const currentUserId = session.user.id;

    // Only allow the assigned reviewer, editors, or admins to submit reviews
    if (userType === "REVIEWER" && currentUserId !== reviewerId) {
      return NextResponse.json(
        { success: false, message: "You can only submit your own reviews." },
        { status: 403 }
      );
    }

    if (!["REVIEWER", "EDITOR", "ADMIN"].includes(userType)) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions to submit reviews." },
        { status: 403 }
      );
    }

    // Verify the paper exists and is in a reviewable state
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: { reviews: true }
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Paper not found." },
        { status: 404 }
      );
    }

    // Check if paper is in a state where reviews can be submitted
    const reviewableStates: PaperStatus[] = [
      PaperStatus.ON_REVIEW, 
      PaperStatus.REVIEWER_ALLOCATION,
      PaperStatus.EDITOR_ALLOCATION,
      PaperStatus.ON_EDIT
    ];

    if (!reviewableStates.includes(paper.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Paper is not in a reviewable state. Current status: ${paper.status}` 
        },
        { status: 400 }
      );
    }

    // Check if review already exists, if so update it, otherwise create new
    let existingReview = await prisma.paperReview.findFirst({
      where: {
        paperId: paperId,
        reviewerId: reviewerId,
      },
    });

    let review;
    
    if (existingReview) {
      // Update existing review
      review = await prisma.paperReview.update({
        where: { id: existingReview.id },
        data: {
          reviewText,
          rating,
          correspondingFile,
          reviewerStatus: reviewerStatus || ReviewerStatus.PENDING,
          updatedAt: new Date(),
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            }
          },
          paper: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          }
        }
      });
    } else {
      // Create new review
      review = await prisma.paperReview.create({
        data: {
          paperId,
          reviewerId,
          reviewText,
          rating,
          correspondingFile,
          reviewerStatus: reviewerStatus || ReviewerStatus.PENDING,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            }
          },
          paper: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          }
        }
      });
    }

    // Update paper status based on review submission
    let newPaperStatus = paper.status;
    
    if (reviewerStatus === "ACCEPTED_FOR_PUBLICATION") {
      newPaperStatus = PaperStatus.ACCEPTED;
    } else if (reviewerStatus === "REJECTED_FOR_PUBLICATION") {
      newPaperStatus = PaperStatus.REJECTED;
    } else if (reviewerStatus === "ACCEPTED_FOR_REVIEW" && paper.status === PaperStatus.REVIEWER_ALLOCATION) {
      newPaperStatus = PaperStatus.ON_REVIEW;
    }

    // Update paper status if it has changed
    if (newPaperStatus !== paper.status) {
      await prisma.researchPaper.update({
        where: { id: paperId },
        data: { 
          status: newPaperStatus,
          lastUpdated: new Date(),
          ...(newPaperStatus === PaperStatus.ACCEPTED ? { acceptedDate: new Date() } : {})
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review published successfully.",
      review: review,
      paperStatus: newPaperStatus,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error publishing review:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error occurred while publishing review.", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET handler for fetching reviews
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const paperId = searchParams.get("paperId");
    const reviewerId = searchParams.get("reviewerId");

    let whereClause: any = {};

    if (paperId) {
      whereClause.paperId = paperId;
    }

    if (reviewerId) {
      whereClause.reviewerId = reviewerId;
    }

    // Role-based access control
    const userType = session.user.userType;
    const currentUserId = session.user.id;

    if (userType === "REVIEWER" && !reviewerId) {
      // Reviewers can only see their own reviews
      whereClause.reviewerId = currentUserId;
    } else if (userType === "USER") {
      // Regular users cannot access review data
      return NextResponse.json(
        { success: false, message: "Insufficient permissions." },
        { status: 403 }
      );
    }

    const reviews = await prisma.paperReview.findMany({
      where: whereClause,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          }
        },
        paper: {
          select: {
            id: true,
            title: true,
            status: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      reviews: reviews,
    });

  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error occurred while fetching reviews.", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT handler for updating review status (for editors/admins)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    // Only editors and admins can update review status
    if (!["EDITOR", "ADMIN"].includes(session.user.userType)) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { reviewId, reviewerStatus } = body;

    if (!reviewId || !reviewerStatus) {
      return NextResponse.json(
        { success: false, message: "Review ID and status are required." },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.paperReview.update({
      where: { id: reviewId },
      data: {
        reviewerStatus: reviewerStatus as ReviewerStatus,
        updatedAt: new Date(),
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        paper: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Review status updated successfully.",
      review: updatedReview,
    });

  } catch (error: any) {
    console.error("Error updating review status:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error occurred while updating review status.", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
