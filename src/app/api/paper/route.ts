import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthorOrContact } from "@/types/dataTypes";
import { sendSuccessfulUploadPaperEmail } from "@/helper/mail/sendSuccessfulUploadPaperMail";
import {
  EditorStatus,
  PaperStatus,
  ResearchPaper,
  ReviewerStatus,
} from "@prisma/client";
import { deleteFileByDownloadURL } from "@/lib/deleteTOFirebase";
import { sendReviewerPaperMail } from "@/helper/mail/send-reviewer-new-paper-mail";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    const data = body as ResearchPaper & {
      keywords: string[];
      contributors: AuthorOrContact[];
      pointOfContact?: AuthorOrContact;
    };

    console.log("Processed data:", JSON.stringify(data, null, 2));

    // Validate authorId if provided
    if (data.authorId) {
      const authorExists = await prisma.user.findUnique({
        where: { id: data.authorId },
      });
      
      if (!authorExists) {
        console.error("Author not found:", data.authorId);
        return NextResponse.json(
          { error: "Invalid author ID" },
          { status: 400 }
        );
      }
    }

    const paper = await prisma.researchPaper.create({
      data: {
        ...data,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    // Optionally, you can send an email notification here
    await sendSuccessfulUploadPaperEmail(paper);

    return NextResponse.json({ paper }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating paper:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const skip = (page - 1) * limit;
  const status = searchParams.get("status"); // Default to PUBLISH if not provided
  const authorId = searchParams.get("authorId");
  const reviewerId = searchParams.get("reviewerId");
  const editorId = searchParams.get("editorId");
  const paperId = searchParams.get("paperId");
  const keywords = searchParams.getAll("keywords");
  const titles = searchParams.getAll("title");
  const sortBy = searchParams.get("sortBy") || "submissionDate";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";
  //console.log("status", status);
  //console.log("page", page);
  try {
    const where: any = {
      ...(authorId && { authorId }),
      ...(reviewerId && { reviewerId }),
      ...(keywords.length > 0 && {
        keywords: {
          hasSome: keywords.map((k) => k.trim()).filter((k) => k !== ""),
        },
      }),
      ...(titles.length > 0 && {
        OR: titles.map((t) => ({
          title: {
            contains: t,
            mode: "insensitive",
          },
        })),
      }),
      ...(status && { status }),
      ...(editorId && { editorId }),
      ...(paperId && { id: paperId }),
      // Add other filters as needed
    };

    const [papers, total] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          editor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.researchPaper.count({ where }),
    ]);

    return NextResponse.json({
      papers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    const { paperIds } = body as { paperIds: string[] };
    if (!Array.isArray(paperIds) || paperIds.length === 0) {
      return NextResponse.json(
        { message: "No paper IDs provided." },
        { status: 400 }
      );
    }
    const existingPapers = await prisma.researchPaper.findMany({
      where: { id: { in: paperIds } },
      select: {
        id: true,
        filePath: true,
        coverLetterPath: true,
      },
    });
    // Step 2: Attempt to delete each file from Firebase
    for (const paper of existingPapers) {
      if (paper.filePath) await deleteFileByDownloadURL(paper.filePath);
      if (paper.coverLetterPath)
        await deleteFileByDownloadURL(paper.coverLetterPath);
    }

    const deleteResult = await prisma.researchPaper.deleteMany({
      where: { id: { in: paperIds } },
    });

    return NextResponse.json(
      {
        message: `Successfully deleted ${deleteResult.count} paper(s).`,
        deletedCount: deleteResult.count,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting papers:", error);
    return NextResponse.json(
      { message: "Failed to delete papers.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get("paperId");
    if (!paperId) {
      return NextResponse.json(
        { error: "Paper ID is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    console.log("Update paper body:", body);

    const allowedUpdates = [
      "title",
      "abstract",
      "filePath",
      "keywords",
      "rating",
      "coverLetterPath",
      "status",
      "reviewerId",
      "reviewerStatus",
      "editorId",
      "editorStatus",
      "contributors",
      "pointOfContact",
    ];

    const dataToUpdate: Record<string, any> = {};

    // Prepare update data
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        dataToUpdate[key] = body[key];
      }
    }

    // Validate status enums
    if (
      dataToUpdate.status &&
      !Object.values(PaperStatus).includes(dataToUpdate.status)
    ) {
      return NextResponse.json(
        { error: "Invalid paper status" },
        { status: 400 }
      );
    }
    if (
      dataToUpdate.reviewerStatus &&
      !Object.values(ReviewerStatus).includes(dataToUpdate.reviewerStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid reviewer status" },
        { status: 400 }
      );
    }
    if (
      dataToUpdate.editorStatus &&
      !Object.values(EditorStatus).includes(dataToUpdate.editorStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid editor status" },
        { status: 400 }
      );
    }

    // Verify reviewer exists
    if (dataToUpdate.reviewerId) {
      const reviewerExists = await prisma.user.findUnique({
        where: { id: dataToUpdate.reviewerId },
      });
      if (!reviewerExists) {
        return NextResponse.json(
          { error: "Reviewer ID is invalid or user does not exist" },
          { status: 400 }
        );
      }
    }

    // Delete old filePath if updating it
    if (dataToUpdate.filePath || dataToUpdate.coverLetterPath) {
      const current = await prisma.researchPaper.findUnique({
        where: { id: paperId },
        select: { filePath: true, coverLetterPath: true },
      });

      if (dataToUpdate.filePath && current?.filePath) {
        await deleteFileByDownloadURL(current.filePath);
      }
      if (dataToUpdate.coverLetterPath && current?.coverLetterPath) {
        await deleteFileByDownloadURL(current.coverLetterPath);
      }
    }

    // Clear reviewer/editor if REJECTED
    if (dataToUpdate.reviewerStatus === "REJECTED_FOR_REVIEW") {
      dataToUpdate.reviewerId = null;
    }
    if (dataToUpdate.editorStatus === "REJECTED_FOR_EDIT") {
      dataToUpdate.editorId = null;
    }

    // Convert JSON fields safely
    if (body.contributors) {
      dataToUpdate.contributors = JSON.stringify(body.contributors);
    }
    if (body.pointOfContact) {
      dataToUpdate.pointOfContact = JSON.stringify(body.pointOfContact);
    }

    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: dataToUpdate,
      include: {
        author: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } },
      },
    });

    // Send reviewer notification
    if (dataToUpdate.reviewerId) {
      const fullReviewer = await prisma.user.findUnique({
        where: { id: dataToUpdate.reviewerId },
      });

      if (fullReviewer) {
        await sendReviewerPaperMail(updatedPaper, fullReviewer);
      }
    }

    // Parse JSON fields before sending back
    const responsePaper = {
      ...updatedPaper,
      contributors:
        typeof updatedPaper.contributors === "string"
          ? JSON.parse(updatedPaper.contributors)
          : updatedPaper.contributors,
      pointOfContact:
        typeof updatedPaper.pointOfContact === "string"
          ? JSON.parse(updatedPaper.pointOfContact)
          : updatedPaper.pointOfContact,
    };

    return NextResponse.json(responsePaper);
  } catch (error) {
    console.error("Failed to update paper:", error);
    return NextResponse.json(
      { error: "Failed to update paper" },
      { status: 500 }
    );
  }
}
