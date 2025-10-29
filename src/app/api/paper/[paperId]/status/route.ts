import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum([
    "UPLOAD",
    "REVIEWER_ALLOCATION", 
    "ON_REVIEW",
    "EDITOR_DECISION",
    "ACCEPTED",
    "REJECTED",
    "PUBLISH"
  ]),
  feedback: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
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

    const { paperId } = await context.params;
    const body = await req.json();
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid status data", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { status, feedback } = validation.data;

    // Check if paper exists
    const existingPaper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: true,
      }
    });

    if (!existingPaper) {
      return NextResponse.json(
        { success: false, message: "Paper not found" },
        { status: 404 }
      );
    }

    // Update the paper status
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        status: status,
        lastUpdated: new Date(),
        ...(status === "ACCEPTED" && { acceptedDate: new Date() }),
      },
      include: {
        author: true,
        reviews: {
          include: {
            reviewer: true,
          },
        },
      },
    });

    // TODO: Send notification emails based on status change
    // You can implement email sending logic here based on the new status
    // Example:
    // if (status === "ACCEPTED" || status === "REJECTED") {
    //   await sendDecisionEmail(updatedPaper, feedback);
    // }

    return NextResponse.json({
      success: true,
      message: `Paper status updated to ${status}`,
      paper: updatedPaper,
    });

  } catch (error: any) {
    console.error("Error updating paper status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update paper status", error: error.message },
      { status: 500 }
    );
  }
}