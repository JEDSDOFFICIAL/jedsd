import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schema for validating the paperId from the URL parameters
const paperIdSchema = z.object({
  paperId: z.string(),
});

// GET /api/research-papers/[paperId] - Fetch details of a single research paper
export async function GET( req: NextRequest,
  context: { params: Promise<{ paperId: string }> }) {
 
  try {
     const { paperId } = await context.params;
     console.log("Fetching details for paperId:", paperId);

    const validationResult = paperIdSchema.safeParse({ paperId });

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

    const paper = await prisma.researchPaper.findUnique({
      where: { paperId: paperId },
      include: {
        author: {
          select: { id:  true, name: true, email: true, userType: true },
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
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

    // Find paper to resolve UUID vs human-readable paperId
    const paper = await prisma.researchPaper.findFirst({
      where: {
        OR: [
          { id: paperId },
          { paperId: paperId }
        ]
      }
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }

    // Delete reviews referencing the paper first
    const reviewDelete = await prisma.paperReview.deleteMany({
      where: {
        paperId: paper.id
      }
    });

    // Delete paper
    const deleteResult = await prisma.researchPaper.delete({
      where: { id: paper.id },
    });

    return NextResponse.json({
      success: true,
      message: "Research paper deleted successfully.",
      deletedPaper: deleteResult,
      deletedReviews: reviewDelete.count
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Server Error in deleting in [PaperId] route",
      error: error.message
    }, { status: 500 });
  }
}
// app/api/research-papers/[paperId]/route.ts (Add this PATCH function alongside your GET function)
const updatePaperSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").optional(),
  abstract: z.string().min(1, "Abstract cannot be empty.").optional(),
  filePath: z.string().min(1, "File path cannot be empty.").optional(),
  keywords: z.array(z.string().min(1, "Keyword cannot be empty.")).optional(),
  rating: z.number().min(0).max(5).optional().nullable(), // Allow 0-5 with decimals and nullable
  submissionDate: z.coerce.date().optional(), // Expecting an ISO date string
  acceptedDate: z.coerce.date().optional().nullable(), // Expecting an ISO date string or null
  doi: z.string().optional().nullable(), // Digital Object Identifier
  coverLetterPath: z.string().optional().nullable(),
  correspondingFile: z.string().min(1, "File path cannot be empty.").optional().nullable(),
  editorDecisionFile: z.string().optional().nullable(),
  editorDecision: z.enum(["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"]).optional().nullable(),
  editorComments: z.string().optional().nullable(),
  contributors: z.array(z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    contactNumber: z.string().min(1, "Contact Number is required"),
    affiliation: z.string().min(1, "Affiliation is required"),
  })).optional(),
  pointOfContact: z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    contactNumber: z.string().min(1, "Contact Number is required"),
    affiliation: z.string().min(1, "Affiliation is required"),
  }).optional(),
});


// PATCH /api/research-papers/[paperId] - Update a research paper
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }
  try {
    const { paperId } = await context.params;

    const validationResult = paperIdSchema.safeParse({ paperId });
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid paper ID provided.", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const body = await req.json();
    const bodyValidationResult = updatePaperSchema.safeParse(body);

    if (!bodyValidationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data for update.", errors: bodyValidationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = bodyValidationResult.data;
    console.log("Update data received:", updateData);
    console.log("File path in update data:", updateData.filePath);
    console.log("Corresponding file in update data:", updateData.correspondingFile);

    // Check if there's any data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const existingPaper = await prisma.researchPaper.findUnique({
      where: { paperId: paperId },
    });

    if (!existingPaper) {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }

    

    const updatedPaper = await prisma.researchPaper.update({
      where: { paperId: paperId },
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
