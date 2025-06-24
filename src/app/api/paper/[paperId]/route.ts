import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PaperStatus } from "@prisma/client";
import { sendReviewerPaperMail } from "@/helper/mail/send-reviewer-new-paper-mail";

const prisma = new PrismaClient();

// GET /api/paper/[paperId]
/// Fetches a single research paper by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await params;

    const paper = await prisma.researchPaper.findUnique({
      where: { id: paperId },
      include: {
        author: {
          select: {
            id: true,
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
      },
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    const parsedContributors =
      typeof paper.contributors === "string"
        ? JSON.parse(paper.contributors)
        : paper.contributors;

    const parsedPointOfContact =
      typeof paper.pointOfContact === "string"
        ? JSON.parse(paper.pointOfContact)
        : paper.pointOfContact;

    const response = {
      ...paper,
      contributors: parsedContributors,
      pointOfContact: parsedPointOfContact,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch paper:", error);
    return NextResponse.json(
      { error: "Failed to fetch paper" },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await params;
    const body = await request.json();
    console.log("Request body for updating paper:", body);

    const allowedUpdates = [
      "title",
      "abstract",
      "filePath",
      "status",
      "keywords",
      "rejectionRemark",
      "reviewerId",
      "coverLetterPath",
      "reviewerStatus",
    ];

    const dataToUpdate: Record<string, any> = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        dataToUpdate[key] = body[key];
      }
    }

    if (body.contributors !== undefined) {
      dataToUpdate.contributors = JSON.stringify(body.contributors);
    }
    if (body.pointOfContact !== undefined) {
      dataToUpdate.pointOfContact = JSON.stringify(body.pointOfContact);
    }

    if (
      dataToUpdate.status &&
      !Object.values(PaperStatus).includes(dataToUpdate.status)
    ) {
      return NextResponse.json(
        { error: "Invalid paper status" },
        { status: 400 }
      );
    }
if (dataToUpdate.reviewerId) {
  console.log("Checking if reviewer exists in DB...");
  const reviewerExists = await prisma.user.findUnique({
    where: { id: dataToUpdate.reviewerId },
  });

  if (!reviewerExists) {
    console.error("Reviewer not found in database");
    return NextResponse.json(
      { error: "Reviewer ID is invalid or user does not exist" },
      { status: 400 }
    );
  }
}


    const updatedPaper = await prisma.researchPaper.update({
      where: { id: paperId },
      data: dataToUpdate,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (dataToUpdate.reviewerId){
      // Fetch the full reviewer object required by sendReviewerPaperMail
      const fullReviewer = await prisma.user.findUnique({
        where: { id: dataToUpdate.reviewerId },
      });
      if (fullReviewer) {
        await sendReviewerPaperMail(updatedPaper, fullReviewer);
        console.log("Reviewer allocation email sent successfully.");
      }
    }

    const responsePaper = {
      ...updatedPaper,
    };
    responsePaper.contributors =
      typeof updatedPaper.contributors === "string"
        ? JSON.parse(updatedPaper.contributors)
        : updatedPaper.contributors;
    responsePaper.pointOfContact =
      typeof updatedPaper.pointOfContact === "string"
        ? JSON.parse(updatedPaper.pointOfContact)
        : updatedPaper.pointOfContact;

    return NextResponse.json(responsePaper);
  } catch (error) {
    console.error("Failed to update paper:", error);
    return NextResponse.json(
      { error: "Failed to update paper" },
      { status: 500 }
    );
  }
}
// DELETE /api/paper/[paperId]
// Deletes a research paper by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const { paperId } = await params;

    // In your original schema, there are no explicit relational models
    // like PaperAuthorContribution. So, direct deletion of the paper is assumed.
    // If you add such models later, you'd need to delete dependent records first.

    await prisma.researchPaper.delete({
      where: { id: paperId },
    });

    return NextResponse.json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("Failed to delete paper:", error);
    return NextResponse.json(
      { error: "Failed to delete paper" },
      { status: 500 }
    );
  }
}