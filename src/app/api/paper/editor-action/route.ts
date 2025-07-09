import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NotificationService } from "@/helper/mail";
import { EditorStatus, PaperStatus } from "@prisma/client";

const editorActionSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
  action: z.enum(["ACCEPT_EDIT", "REJECT_EDIT", "ACCEPT_PUBLICATION", "REJECT_PUBLICATION"]),
  editorNotes: z.string().optional(),
  correspondingFile: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== "EDITOR") {
      return NextResponse.json(
        { error: "Unauthorized. Only editors can perform this action." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = editorActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { paperId, action, editorNotes, correspondingFile } = parsed.data;

    // Find the paper and verify editor assignment
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: true,
        editor: true,
      },
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }

    if (paper.editorId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not assigned as the editor for this paper" },
        { status: 403 }
      );
    }

    // Map action to editor status
    const statusMap = {
      ACCEPT_EDIT: EditorStatus.ACCEPTED_FOR_EDIT,
      REJECT_EDIT: EditorStatus.REJECTED_FOR_EDIT,
      ACCEPT_PUBLICATION: EditorStatus.ACCEPTED_FOR_PUBLICATION,
      REJECT_PUBLICATION: EditorStatus.REJECTED_FOR_PUBLICATION,
    };

    const editorStatus = statusMap[action];
    
    // Determine new paper status
    let newPaperStatus = paper.status;
    if (action === "ACCEPT_EDIT") {
      newPaperStatus = PaperStatus.ON_EDIT;
    } else if (action === "REJECT_EDIT") {
      newPaperStatus = PaperStatus.EDITOR_ALLOCATION;
    } else if (action === "ACCEPT_PUBLICATION") {
      newPaperStatus = PaperStatus.ACCEPTED;
    } else if (action === "REJECT_PUBLICATION") {
      newPaperStatus = PaperStatus.REJECTED;
    }

    // Create/update review record with editor information
    await prisma.paperReview.create({
      data: {
        paperId,
        editorId: session.user.id,
        reviewText: editorNotes || "",
        correspondingFile,
        editorStatus,
      },
    });

    // Update paper status and editor status
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        status: newPaperStatus,
        editorStatus,
        ...(action === "ACCEPT_PUBLICATION" && { acceptedDate: new Date() }),
      },
      include: {
        author: true,
        editor: true,
      },
    });

    // Send notifications
    if (paper.editor) {
      await NotificationService.sendEditorStatusNotifications(
        updatedPaper,
        paper.editor,
        editorStatus.toString(),
        editorNotes
      );
    }

    // Send status update notifications if paper status changed
    if (newPaperStatus !== paper.status) {
      await NotificationService.sendPaperStatusUpdateNotifications(
        updatedPaper,
        newPaperStatus.toString(),
        `Editor ${action.toLowerCase().replace('_', ' ')}: ${editorNotes || 'No additional comments'}`
      );
    }

    return NextResponse.json({
      message: `Editor ${action.toLowerCase().replace('_', ' ')} successfully`,
      paper: updatedPaper,
    });

  } catch (error) {
    console.error("Editor action error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
