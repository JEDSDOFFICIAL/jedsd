import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaperStatus, EditorStatus } from "@prisma/client";
import { NotificationService } from "@/helper/mail";

export async function POST(req: NextRequest) {
  try {
    const { paperId, editorId, isReassignment } = await req.json();
console.log("Assign Editor Request:", { paperId, editorId, isReassignment });
    if (!paperId || !editorId) {
      return NextResponse.json(
        { error: "Paper ID and Editor ID are required" },
        { status: 400 }
      );
    }

    // Check if paper exists and is in correct status
    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } }
      }
    });

    if (!paper) {
      return NextResponse.json(
        { error: "Paper not found" },
        { status: 404 }
      );
    }
    console.log("Paper found:", paper.reviewerStatus);
    
    // For initial assignment, check reviewer approval
    if (!isReassignment && paper.reviewerStatus !== "ACCEPTED_FOR_PUBLICATION") {
      return NextResponse.json(
        { error: "Paper must be accepted by reviewer first" },
        { status: 400 }
      );
    }

    // For reassignment, check if editor status allows reassignment
    if (isReassignment) {
      if (!paper.editorId) {
        return NextResponse.json(
          { error: "No editor currently assigned to reassign" },
          { status: 400 }
        );
      }
      
      if (!["PENDING", "REJECTED_FOR_EDIT", "REJECTED_FOR_PUBLICATION"].includes(paper.editorStatus)) {
        return NextResponse.json(
          { error: "Editor can only be reassigned when status is PENDING or REJECTED" },
          { status: 400 }
        );
      }
    }

    // Check if editor exists and has EDITOR role
    const editor = await prisma.user.findUnique({
      where: { id: editorId },
    });

    if (!editor || (editor.userType !== "EDITOR" && editor.userType !== "ADMIN")) {
  return NextResponse.json(
    { error: "Invalid editor or user is not an editor/admin" },
    { status: 400 }
  );
}


    // Update paper with editor and change status
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: {
        editorId: editorId,
        status: PaperStatus.EDITOR_ALLOCATION,
        editorStatus: EditorStatus.PENDING
      },
      include: {
        author: true,
        reviewer: true,
        editor: true
      }
    });

    // Send email notifications to all relevant parties
    if (updatedPaper.editor) {
      await NotificationService.sendEditorAssignmentNotifications(updatedPaper, updatedPaper.editor);
    }

    const successMessage = isReassignment ? "Editor reassigned successfully" : "Editor assigned successfully";

    return NextResponse.json({
      message: successMessage,
      paper: updatedPaper
    });

  } catch (error) {
    console.error("Error assigning editor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
