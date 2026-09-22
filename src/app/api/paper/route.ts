import { NextResponse } from "next/server";
import { PaperStatus } from "@prisma/client";
import { z } from "zod";
import { sendPaperUploadMail } from "@/helper/send_Author_and_POC_Paper_Upload_Mail";
import { sendSpecialPaperUploadMailToEditor } from "@/helper/send_special_mail_for_new_paper";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  sourceZipPath: z
    .string()
    .url("Invalid source zip path URL.")
    .optional()
    .nullable(),
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }
  const generateUniquePaperId = async () => {
    let paperId;
    let existingPaper;

    do {
      paperId = `JEDSD-P-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      existingPaper = await prisma.researchPaper.findUnique({
        where: { paperId: paperId },
      });
    } while (existingPaper);

    return paperId;
  };
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
      sourceZipPath,
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
   const paperId = await generateUniquePaperId();
    // Create the research paper entry
    const newPaper = await prisma.researchPaper.create({
      data: {
        paperId, // Generated unique paper ID
        title,
        abstract,
        filePath,
        correspondingFile: sourceZipPath,
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
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.variableUserType;
    const userId = session?.user?.id;
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";

    const { searchParams } = new URL(request.url);

    // Build the dynamic 'where' clause
    const where: any = {};

    const authorId = searchParams.get("authorId");
    if (authorId) {
      where.authorId = authorId;
    }
    const paperId = searchParams.get("paperId");
    if (paperId) {
      where.paperId = paperId;
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

    const statuses = searchParams.getAll("status");
    if (statuses.length > 0) {
      if (statuses.length === 1) {
        where.status = statuses[0];
      } else {
        where.status = {
          in: statuses
        };
      }
    } else if (!isAdminOrEditor && !authorId && !reviewerId) {
      // If public request, only allow public statuses
      where.status = {
        in: ["ACCEPTED", "PRE_PUBLICATION", "FINAL_FILES_REQUESTED", "FINAL_FILES_RECEIVED", "DOI_ASSIGNED", "PUBLISHED"]
      };
    }

    const reviewerStatus = searchParams.get("reviewerStatus");
    if (reviewerStatus && reviewerId) {
      where.reviews = {
        some: {
          reviewerId: reviewerId,
          reviewerStatus: reviewerStatus,
        },
      };
    } else if (reviewerStatus) {
      where.reviews = {
        some: {
          reviewerStatus: reviewerStatus,
        },
      };
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const [papers, totalPapers] = await prisma.$transaction([
      prisma.researchPaper.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, userType: true, affiliation: true },
          },
          reviews: isAdminOrEditor || reviewerId || authorId ? {
            select: {
              id: true,
              reviewerId: true,
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  affiliation: true,
                },
              },
              reviewText: true,
              reviewTextForAuthor: true,
              correspondingFile: true,
              rating: true,
              reviewerStatus: true,
              createdAt: true,
              updatedAt: true,
            },
          } : false,
        },
        orderBy: {
          submissionDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.researchPaper.count({ where }),
    ]);

    // Strip private info for public requests or if user is not author/editor
    const sanitizedPapers = papers.map(paper => {
      const isOwner = userId === paper.authorId;
      const isReviewerForPaper = paper.reviews?.some(r => r.reviewerId === userId);
      const canViewPrivate = isAdminOrEditor || isOwner || isReviewerForPaper;

      if (!canViewPrivate) {
        // Strip private fields
        const { coverLetterPath, correspondingFile, editorComments, editorDecisionFile, editorDecision, reviews, ...publicPaper } = paper;
        return publicPaper;
      }
      
      // If author, remove private reviewText intended for editor only
      if (isOwner && !isAdminOrEditor) {
        return {
          ...paper,
          reviews: paper.reviews?.map(r => {
            const { reviewText, ...publicReview } = r;
            return publicReview;
          })
        };
      }
      
      // If reviewer, only see their own review and not cover letter unless granted (handled by files API normally)
      if (isReviewerForPaper && !isAdminOrEditor && !isOwner) {
         return {
           ...paper,
           coverLetterPath: null,
           correspondingFile: null,
           editorDecisionFile: null,
           editorComments: null,
           reviews: paper.reviews?.filter(r => r.reviewerId === userId)
         };
      }

      return paper;
    });

    return NextResponse.json({
      success: true,
      message: "Research papers fetched successfully.",
      papers: sanitizedPapers,
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }
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
  doi: z.string().optional().nullable(),
  contributors: z.array(contactInfoSchema).optional(),
  pointOfContact: contactInfoSchema.optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
  submissionDate: z.coerce.date().optional(),
  acceptedDate: z.coerce.date().optional().nullable(),
  editorDecision: z.enum(["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"]).optional().nullable(),
  editorComments: z.string().optional().nullable(),
  editorDecisionFile: z.string().url("Invalid decision file URL.").optional().nullable(),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }
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
        ...updateData
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
