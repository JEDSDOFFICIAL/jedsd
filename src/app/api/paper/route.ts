// app/api/research-papers/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, PaperStatus } from "@prisma/client";
import { z } from "zod";
import { sendPaperUploadMail } from "@/helper/send_Author_and_POC_Paper_Upload_Mail";
import { sendSpecialPaperUploadMailToEditor } from "@/helper/send_special_mail_for_new_paper";

const prisma = new PrismaClient();

// --- Zod Schemas for Request Validation ---
const contactInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email format."),
  affiliation: z.string().min(1, "Affiliation is required."),
  contactNumber: z.string().min(1, "Contact number is required."),
});
// Schema for uploading a research paper (POST request)
const uploadPaperSchema = z.object({
  title: z.string().min(1, "Title is required."),
  abstract: z.string().min(1, "Abstract is required."),
  filePath: z
    .string()
    .url("Invalid file path URL.")
    .min(1, "File path is required."),
  keywords: z
    .array(z.string().min(1, "Keyword cannot be empty."))
    .min(1, "At least one keyword is required."),
  coverLetterPath: z
    .string()
    .url("Invalid cover letter path URL.")
    .optional()
    .nullable(),
  authorId: z.string().uuid("Invalid authorId format."),
  contributors: z.array(contactInfoSchema), // Zod's .json() or more specific schema if structure is known
  pointOfContact: contactInfoSchema, // Zod's .json() or more specific schema if structure is known
});

// Schema for deleting multiple research papers (DELETE request)
const deletePapersSchema = z.object({
  paperIds: z
    .array(z.string().uuid("Invalid paper ID format in array."))
    .min(1, "At least one paper ID is required for deletion."),
});

// --- API Route Handlers ---

// POST /api/research-papers - Upload a new research paper
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = uploadPaperSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      title,
      abstract,
      filePath,
      keywords,
      coverLetterPath,
      authorId,
      contributors,
      pointOfContact,
    } = validationResult.data;
    console.log("backend data is ,", validationResult.data);
    // Verify author exists and is a USER (or AUTHOR, depending on your UserType definition for authors)
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      return NextResponse.json(
        { success: false, message: "Author not found." },
        { status: 404 }
      );
    }

    const newPaper = await prisma.researchPaper.create({
      data: {
        title,
        abstract,
        filePath,
        keywords,
        coverLetterPath,
        authorId,
        contributors,
        pointOfContact,
        status: PaperStatus.UPLOAD, // Default status for new uploads
      },
    });
    // Collect all emails: contributors + point of contact + author
    // Collect all emails: contributors + point of contact + author
    const sendingEmails: string[] = [
      author.email, // Main author email
      pointOfContact.email, // Point of contact email
      ...contributors.map(contributor => contributor.email), // All contributors' emails
    ];

    // Remove duplicates (in case same person is listed multiple times)
    const uniqueEmails = [...new Set(sendingEmails)];

    console.log("Sending emails to:", uniqueEmails);


    const sendMail = await sendPaperUploadMail({paper:newPaper,emails:uniqueEmails})
    console.log("Paper upload email sent:", sendMail);
    const editorMail = await sendSpecialPaperUploadMailToEditor(newPaper)

    return NextResponse.json(
      {
        success: true,
        message: "Research paper uploaded successfully.",
        paper: newPaper,
      },
      { status: 201 }
    ); // 201 Created
  } catch (error: any) {
    console.error("Error uploading research paper:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/research-papers - Fetch all research papers

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Build the dynamic 'where' clause
    const where: any = {};

    const authorId = searchParams.get("authorId");
    if (authorId) {
      where.authorId = authorId;
    }

    const reviewerId = searchParams.get("reviewerId");
    if (reviewerId) {
      where.reviews = {
        some: {
          reviewerId: reviewerId,
        },
      };
    }

    const keywords = searchParams.get("keywords");
    if (keywords) {
      where.keywords = {
        has: keywords, // assuming keywords is a list or array
      };
    }

    const title = searchParams.get("title");
    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive", // Case-insensitive search
      };
    }

    const status = searchParams.get("status");
    if (status) {
      where.status = status;
    }

    const reviewerStatus = searchParams.get("reviewerStatus");
    if (reviewerStatus && reviewerId) {
      // Filter papers where the specific reviewer has this status
      where.reviews = {
        some: {
          reviewerId: reviewerId,
          reviewerStatus: reviewerStatus,
        },
      };
    } else if (reviewerStatus) {
      // Filter papers where any reviewer has this status
      where.reviews = {
        some: {
          reviewerStatus: reviewerStatus,
        },
      };
    }

    // Handle Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [papers, totalPapers] = await prisma.$transaction([
      prisma.researchPaper.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, userType: true },
          },
          reviews: {
            select: {
              id: true,
              reviewerId: true,
              reviewer: {
                select: {
                  name: true,
                  email: true,
                },
              },

              reviewText: true,
              rating: true,
              reviewerStatus: true,
            },
          },
        },
        orderBy: {
          submissionDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.researchPaper.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Research papers fetched successfully.",
      papers,
      total: totalPapers,
      page,
      totalPages: Math.ceil(totalPapers / limit),
    });
  } catch (error: any) {
    console.error("Error fetching research papers:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/research-papers - Delete multiple research papers
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const validationResult = deletePapersSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { paperIds } = validationResult.data;

    const deleteResult = await prisma.researchPaper.deleteMany({
      where: {
        id: {
          in: paperIds,
        },
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No research papers found with the provided IDs for deletion.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} research paper(s).`,
      deletedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error("Error deleting research papers:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Schema for updating a research paper (PUT request)
const updatePaperSchema = z.object({
  paperId: z.string().uuid("Invalid paperId format."),
  title: z.string().min(1, "Title is required.").optional(),
  abstract: z.string().min(1, "Abstract is required.").optional(),
  filePath: z.string().url("Invalid file path URL.").optional(),
  keywords: z.array(z.string().min(1, "Keyword cannot be empty.")).optional(),
  coverLetterPath: z.string().url("Invalid cover letter path URL.").optional().nullable(),
  contributors: z.array(contactInfoSchema).optional(),
  pointOfContact: contactInfoSchema.optional(),
});

// PUT /api/paper - Update an existing research paper
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const paperId = url.searchParams.get("paperId");

    if (!paperId) {
      return NextResponse.json(
        { success: false, message: "paperId is required as query parameter." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validationResult = updatePaperSchema.safeParse({ ...body, paperId });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid request data.", 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { paperId: validatedPaperId, ...updateData } = validationResult.data;

    // Check if paper exists
    const existingPaper = await prisma.researchPaper.findUnique({
      where: { id: validatedPaperId }
    });

    if (!existingPaper) {
      return NextResponse.json(
        { success: false, message: "Research paper not found." },
        { status: 404 }
      );
    }

    // Update the paper
    const updatedPaper = await prisma.researchPaper.update({
      where: { id: validatedPaperId },
      data: {
        ...updateData,
        lastUpdated: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            affiliation: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Research paper updated successfully.",
      data: updatedPaper
    });

  } catch (error: any) {
    console.error("Error updating research paper:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
