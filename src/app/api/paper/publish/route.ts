import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaperStatus, EditorStatus } from "@prisma/client";
import { NotificationService } from "@/helper/mail";

export async function POST(req: NextRequest) {
  try {
    const { paperId } = await req.json();

    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }

    // Check if paper exists and is ready for publication
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } },
        editor: { select: { name: true, email: true } }
      }
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    if (paper.editorStatus !== EditorStatus.ACCEPTED_FOR_PUBLICATION) {
      return NextResponse.json(
        { error: "Paper must be accepted by editor first" },
        { status: 400 }
      );
    }

    // Update paper status to published
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        status: PaperStatus.PUBLISH,
        acceptedDate: new Date()
      },
      include: {
        author: true,
        reviewer: true,
        editor: true
      }
    });

    // Send publication notifications
    await NotificationService.sendPublicationNotifications(updatedPaper);

    return NextResponse.json({
      message: "Paper published successfully",
      paper: updatedPaper
    });

  } catch (error) {
    console.error("Error publishing paper:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
