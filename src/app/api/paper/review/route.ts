import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReviewerStatus, PaperStatus } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendReviewedMail } from "@/helper/send_reviewer_reviewed_mail";
import { sendThankYouEmail } from "@/helper/send_Thank_you_mail_to_reviewer";

const reviewSubmissionSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  reviewerId: z.string().uuid("Invalid reviewerId format."),

  reviewText: z
    .string()
    .min(10, "Review text must be at least 10 characters."),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5, "Rating must be between 1 and 5."),

  correspondingFile: z
    .string()
    .url("Invalid corresponding file URL.")
    .nullable()
    .optional(),

  reviewerStatus: z
    .nativeEnum(ReviewerStatus, {
      errorMap: () => ({ message: "Invalid reviewer status." }),
    })
    .optional(),
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
      console.log("Validation errors:", validationResult.error.errors);
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


    // Check if review already exists, if so update it, otherwise create new
    const existingReview = await prisma.paperReview.findFirst({
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
    await sendReviewedMail({
      paperId:paper.id,
      paperTitle:paper.title,
      review:review,
      reviewerEmail:review.reviewer.email,
      reviewerName:review.reviewer.name
    })


    await sendThankYouEmail({
      paperId:paper.id,
      paperTitle:paper.title,
      review:review,
      reviewerEmail:review.reviewer.email,
      reviewerName:review.reviewer.name
    })

    return NextResponse.json({
      success: true,
      message: "Review published successfully.",
      review: review,
    }, { status: 200 });

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
export async function GET(req: NextRequest) {
  try {
    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const reviewerId = searchParams.get('reviewerId');
    
    if (!reviewerId) {
      return NextResponse.json(
        { success: false, message: "Reviewer ID is required." },
        { status: 400 }
      );
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count of papers assigned to this reviewer
    const totalCount = await prisma.researchPaper.count({
      where: {
        reviews: {
          some: {
            reviewerId: reviewerId
          }
        }
      }
    });

    // Fetch papers assigned to this reviewer with pagination
    const papers = await prisma.researchPaper.findMany({
      where: {
        reviews: {
          some: {
            reviewerId: reviewerId
          }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        reviews: {
          where: {
            reviewerId: reviewerId
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      },
      skip: skip,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      papers: papers,
      total: totalCount,
      page: page,
      totalPages: totalPages,
      limit: limit
    });

  } catch (error: any) {
    console.error("Error fetching reviewer papers:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error occurred while fetching papers.", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
