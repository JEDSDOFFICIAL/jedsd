

import prisma from "@/lib/prisma"; // Assuming your PrismaClient instance is exported from this path
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaperStatus } from "@prisma/client"; // Import PaperStatus enum

// Zod Schema for validating the paperId from the URL parameters
const paperIdParamSchema = z.object({
  paperId: z.string().uuid("Invalid paper ID format."),
});

// Zod Schema for the request body to update paper status
const updatePaperStatusSchema = z.object({
  status: z.nativeEnum(PaperStatus, {
    errorMap: () => ({ message: "Invalid paper status. Must be ACCEPTED, REJECTED, or PUBLISH." }),
  }).refine(
    (val) => val === PaperStatus.ACCEPTED || val === PaperStatus.REJECTED || val === PaperStatus.PUBLISH,
    { message: "Status must be ACCEPTED, REJECTED, or PUBLISH for publishing/rejecting." }
  ),
});

// PATCH /api/research-papers/[paperId]/status - Update a research paper's publication status
export async function PATCH(req: NextRequest,context: { params: Promise<{ paperId: string }> }) {
  try {

    const paperId = await context.params.then((p) => p.paperId);
    console.log("Updating status for paperId:", paperId);

    // Validate the extracted paperId
    const paperIdValidationResult = paperIdParamSchema.safeParse({ paperId });
    if (!paperIdValidationResult.success) {
      console.log("Paper ID validation failed:", paperIdValidationResult.error);
      return NextResponse.json(
        { success: false, message: "Invalid paper ID provided.", errors: paperIdValidationResult.error.errors },
        { status: 400 }
      );
    }
   
    const validatedPaperId = paperIdValidationResult.data.paperId;


    // 2. Validate request body for status
    const body = await req.json();
    const statusValidationResult = updatePaperStatusSchema.safeParse(body);

    if (!statusValidationResult.success) {
      console.log("Status validation failed:",body.status, statusValidationResult.error);
      return NextResponse.json(
        { success: false, message: "Invalid status provided.", errors: statusValidationResult.error.errors },
        { status: 400 }
      );
    }

    const { status } = statusValidationResult.data;

    // 3. Find the paper and update its status
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: validatedPaperId },
      data: {
        status: status,
        acceptedDate: (status === PaperStatus.ACCEPTED || status === PaperStatus.PUBLISH) ? new Date() : null,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
        reviews: {
          select: {
            reviewer: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Paper status updated to ${status} successfully.`,
      paper: updatedPaper,
    }, { status: 200 });

  } catch (error: any) {
    // Handle Prisma's P2025 error for record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: "Research paper not found with the provided ID." },
        { status: 404 }
      );
    }
    console.error("Error in paper status update route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error in paper status route", error: error.message },
      { status: 500 }
    );
  }
}
