// app/api/research-papers/[paperId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for validating the paperId from the URL parameters
const paperIdSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
});

// GET /api/research-papers/[paperId] - Fetch details of a single research paper
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    // The paperId is expected to be the last segment in a dynamic route like /api/research-papers/[paperId]
    const paperIdparams = pathSegments[pathSegments.length - 1];
    const validationResult = paperIdSchema.safeParse({
      paperId: paperIdparams,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid paper ID provided.",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { paperId } = validationResult.data;

    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: {
          select: { id: true, name: true, email: true, username: true },
        },
        reviews: {
          select: {
            reviewText: true,
            rating: true,
            reviewerStatus: true,
            correspondingFile: true,
            reviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Research paper fetched successfully.",
      paper,
    });
  } catch (error: any) {
    console.error("Error fetching paper details:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {

    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    // The paperId is expected to be the last segment in a dynamic route like /api/research-papers/[paperId]
    const paperIdparams = pathSegments[pathSegments.length - 1];
    const validationResult = paperIdSchema.safeParse({
      paperId: paperIdparams,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid paper ID provided.",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { paperId } = validationResult.data;
    const deleteResult = await prisma.researchPaper.delete({
      where: { id: paperId },
    });
    if (!deleteResult) {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }
    const reviewDelete = await prisma.paperReview.deleteMany({
        where:{
            paperId: paperId
        }
    })
    return NextResponse.json({
      success: true,
      message: "Research paper deleted successfully.",
      deletedPaper: deleteResult,
      deletedReviews: reviewDelete.count
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Server Error in deleting in [PaperId] route",
    });
  }
}
// app/api/research-papers/[paperId]/route.ts (Add this PATCH function alongside your GET function)
const updatePaperSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").optional(),
  abstract: z.string().min(1, "Abstract cannot be empty.").optional(),
  filePath: z.string().url("Invalid file path URL.").min(1, "File path cannot be empty.").optional(),
  keywords: z.array(z.string().min(1, "Keyword cannot be empty.")).min(1, "At least one keyword is required.").optional(),
  rating: z.number().int().min(1).max(5).optional(), // Assuming rating is between 1 and 5
 
});


// PATCH /api/research-papers/[paperId] - Update a research paper
export async function PATCH(
  req: Request
) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    // The paperId is expected to be the last segment in a dynamic route like /api/research-papers/[paperId]
    const paperIdparams = pathSegments[pathSegments.length - 1];
    const validationResult = paperIdSchema.safeParse({
      paperId: paperIdparams,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid paper ID provided.",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { paperId } = validationResult.data;

    const body = await req.json();
    const bodyValidationResult = updatePaperSchema.safeParse(body);

    if (!bodyValidationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data for update.", errors: bodyValidationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = bodyValidationResult.data;

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const existingPaper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
    });

    if (!existingPaper) {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }

    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: updateData, // Prisma will only update the fields present in updateData
    });

    return NextResponse.json({
      success: true,
      message: "Research paper updated successfully.",
      paper: updatedPaper,
    });

  } catch (error: any) {
    console.error("Error updating research paper:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
