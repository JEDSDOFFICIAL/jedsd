import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const reviewerIdSchema = z.string().uuid("Invalid reviewer ID format");

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ reviewerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is editor or admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.userType !== 'EDITOR' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: "Access denied. Editor privileges required." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const reviewerIdValidation = reviewerIdSchema.safeParse(params.reviewerId);

    if (!reviewerIdValidation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid reviewer ID provided", errors: reviewerIdValidation.error.errors },
        { status: 400 }
      );
    }

    const { data: reviewerId } = reviewerIdValidation;

    // Find the reviewer
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId }
    });

    if (!reviewer) {
      return NextResponse.json(
        { success: false, message: "Reviewer not found" },
        { status: 404 }
      );
    }

    // For now, we'll change their user type away from REVIEWER
    // In a more sophisticated system, you might have an 'active' field
    const updatedReviewer = await prisma.user.update({
      where: { id: reviewerId },
      data: { 
        userType: 'AUTHOR' // Default deactivated reviewers to AUTHOR type
      }
    });

    // Also remove any pending review assignments
    await prisma.paperReview.deleteMany({
      where: {
        reviewerId: reviewerId,
        reviewText: "" // Only delete unsubmitted reviews
      }
    });

    return NextResponse.json({
      success: true,
      message: "Reviewer deactivated successfully",
      reviewer: updatedReviewer
    });

  } catch (error: any) {
    console.error("Error deactivating reviewer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to deactivate reviewer", error: error.message },
      { status: 500 }
    );
  }
}