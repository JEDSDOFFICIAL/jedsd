import { NextRequest, NextResponse } from "next/server";
import {  PaperStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";


// Schema for validating the paperId from the URL parameters
const paperIdSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
});

// Schema for optional rejection reason from admin/editor
const rejectPaperSchema = z.object({
  rejectionReason: z.string().optional(),
});

// PATCH /api/paper/[paperId]/reject - Reject a research paper
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    // 1. Check authentication and authorization
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const paperIdParam = params.paperId;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    // Only allow ADMIN and EDITOR to reject papers
    const userType = session.user.variableUserType;
    if (!["ADMIN", "EDITOR"].includes(userType)) {
      return NextResponse.json(
        { success: false, message: "Only admins and editors can reject papers." },
        { status: 403 }
      );
    }

    // 2. Validate paperId
    const paperIdValidationResult = paperIdSchema.safeParse({ paperId: paperIdParam });
    if (!paperIdValidationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid paper ID provided.", errors: paperIdValidationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedPaperId = paperIdValidationResult.data.paperId;

    // 3. Validate request body (optional rejection reason)
    const body = await req.json().catch(() => ({}));
    const rejectValidationResult = rejectPaperSchema.safeParse(body);
    
    if (!rejectValidationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data.", errors: rejectValidationResult.error.errors },
        { status: 400 }
      );
    }

    const { rejectionReason } = rejectValidationResult.data;

    // 4. Find the paper and update its status to REJECTED
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: validatedPaperId },
      data: {
        status: PaperStatus.REJECTED,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    
    return NextResponse.json({
      success: true,
      message: `Paper rejected successfully.`,
      paper: {
        id: updatedPaper.id,
        title: updatedPaper.title,
        status: updatedPaper.status,
      },
    }, { status: 200 });

  } catch (error: any) {
    // Handle Prisma's P2025 error for record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: "Research paper not found with the provided ID." },
        { status: 404 }
      );
    }
    
    console.error("Error in paper reject route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error in paper reject route", error: error.message },
      { status: 500 }
    );
  }
}
