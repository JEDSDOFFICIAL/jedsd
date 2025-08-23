import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaperStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { sendAuthorPaperStatusUpdateMail } from "@/helper/mail/sendAuthorPaperStatusUpdateMail";
import { sendAdminPaperNotificationMail } from "@/helper/mail/sendAdminPaperNotificationMail";

const prisma = new PrismaClient();

// DELETE /api/paper/[paperId]/delete - Delete a research paper
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ paperId: string }> }
) {
  try {
    // 1. Check authentication and authorization
   
    const params = await context.params;
    const paperIdParam = params.paperId;
  

    // 1. Delete all reviews related to the paper
await prisma.paperReview.deleteMany({
  where: { paperId: paperIdParam },
});


    // 4. Find the paper and update its status to ACCEPTED
    const updatedPaper = await prisma.researchPaper.delete({
      where: { id: paperIdParam },
    });

    
    return NextResponse.json({
      success: true,
      message: `Paper accepted for publication successfully.`,
      
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
