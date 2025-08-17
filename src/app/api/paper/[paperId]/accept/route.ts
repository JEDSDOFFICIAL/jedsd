import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaperStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { sendAuthorPaperStatusUpdateMail } from "@/helper/mail/sendAuthorPaperStatusUpdateMail";
import { sendAdminPaperNotificationMail } from "@/helper/mail/sendAdminPaperNotificationMail";

const prisma = new PrismaClient();

// Schema for validating the paperId from the URL parameters
const paperIdSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
});

// Schema for optional notes from admin/editor
const acceptPaperSchema = z.object({
  editorNotes: z.string().optional(),
});

// PATCH /api/paper/[paperId]/accept - Accept a research paper for publication
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

    // Only allow ADMIN and EDITOR to accept papers
    const userType = session.user.userType;
    if (!["ADMIN", "EDITOR"].includes(userType)) {
      return NextResponse.json(
        { success: false, message: "Only admins and editors can accept papers." },
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

    // 3. Validate request body (optional editor notes)
    const body = await req.json().catch(() => ({}));
    const acceptValidationResult = acceptPaperSchema.safeParse(body);
    
    if (!acceptValidationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data.", errors: acceptValidationResult.error.errors },
        { status: 400 }
      );
    }

    const { editorNotes } = acceptValidationResult.data;

    // 4. Find the paper and update its status to ACCEPTED
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: validatedPaperId },
      data: {
        status: PaperStatus.ACCEPTED,
        acceptedDate: new Date(), // Set the acceptance date
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    
    return NextResponse.json({
      success: true,
      message: `Paper accepted for publication successfully.`,
      paper: {
        id: updatedPaper.id,
        title: updatedPaper.title,
        status: updatedPaper.status,
        acceptedDate: updatedPaper.acceptedDate,
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
    
    console.error("Error in paper accept route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error in paper accept route", error: error.message },
      { status: 500 }
    );
  }
}
