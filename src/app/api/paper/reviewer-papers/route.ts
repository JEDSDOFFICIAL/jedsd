import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get("reviewerId");
    if (!reviewerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Reviewer ID is required.",
        },
        { status: 400 }
      );
    }
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    console.log("reviewer id",reviewerId);
    
    const papers = await prisma.researchPaper.findMany({
      take: limit,
      skip: skip,
      where: {
        reviews: {
          some: {
            reviewerId: reviewerId,
          },
        },
      },
      include: {
        author: true,
        reviews:{
          where: { reviewerId: reviewerId }
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: papers,
      count: papers.length,
    });
  } catch (error) {
    console.error("Error fetching reviewer papers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
