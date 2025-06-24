import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendSuccessfulUploadPaperEmail } from "@/helper/mail/sendSuccessfulUploadPaperMail";

// ------------------
// Zod Schema for POST
// ------------------
const paperSchema = z.object({
  title: z.string().min(1),
  abstract: z.string().min(1),
  filePath: z.string().url(),
  keywords: z.array(z.string().min(1)),
  contributors: z.any(), // You can define a stricter shape if known
  pointOfContact: z.any(),
  coverLetterPath: z.string().url().optional(),
  authorId: z.string().uuid(),
});

// -------------------
// POST /api/paper
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = paperSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Validation failed", errors: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    const paper = await prisma.researchPaper.create({
      data: {
        ...data,
        keywords: { set: data.keywords },
        contributors: data.contributors, // Ensure contributors is always set
        pointOfContact: data.pointOfContact, // Ensure pointOfContact is always set if required
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
    await sendSuccessfulUploadPaperEmail(paper)

    return NextResponse.json({ paper }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating paper:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// -------------------
// GET /api/paper
// -------------------
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const skip = (page - 1) * limit;
  const status = searchParams.get("status"); // Default to PUBLISH if not provided
  const authorId = searchParams.get("authorId");
  const reviewerId = searchParams.get("reviewerId");
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
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

// -------------------
// DELETE /api/paper
// -------------------
const deleteSchema = z.object({
  paperIds: z.array(z.string().uuid()).min(1),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid paperIds", errors: parsed.error.format() }, { status: 400 });
    }

    const { paperIds } = parsed.data;

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
