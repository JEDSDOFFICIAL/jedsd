import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET handler for fetching papers assigned to a reviewer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    // Only reviewers can access this endpoint
    if (session.user.userType !== "REVIEWER") {
      return NextResponse.json(
        { success: false, message: "Only reviewers can access this endpoint." },
        { status: 403 }
      );
    }

    const reviewerId = session.user.id;

    // Fetch papers assigned to this reviewer
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
          },
          select: {
            id: true,
            reviewerId: true,
            reviewText: true,
            rating: true,
            reviewerStatus: true,
            correspondingFile: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      papers: papers,
      total: papers.length,
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
