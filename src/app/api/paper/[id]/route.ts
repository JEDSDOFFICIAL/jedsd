import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.userType !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete papers" },
        { status: 403 }
      );
    }

    const { id: paperId } = await params;

    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

    // Check if paper exists
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    // Delete associated reviews first
    await prisma.paperReview.deleteMany({
      where: { paperId: paperId },
    });

    // Delete the paper
    await prisma.researchPaper.delete({
      where: { id: paperId },
    });

    return NextResponse.json({
      message: "Paper deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting paper:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paperId } = await params;

    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            reviewText: true,
            rating: true,
            reviewerStatus: true,
            editorStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(paper);

  } catch (error) {
    console.error("Error fetching paper:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
