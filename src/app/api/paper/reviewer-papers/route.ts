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
    if (session.user.userType ==="USER") {
      return NextResponse.json(
        { success: false, message: "Only reviewers can access this endpoint." },
        { status: 403 }
      );
    }

    const reviewerId = session.user.id;

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count for pagination
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
