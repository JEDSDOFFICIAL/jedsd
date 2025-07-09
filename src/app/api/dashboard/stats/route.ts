import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get paper statistics for dashboard
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");

    // Overall statistics
    const [
      totalPapers,
      uploadedPapers,
      underReviewPapers,
      underEditPapers,
      publishedPapers,
      rejectedPapers,
      totalUsers,
      totalReviewers,
      totalEditors
    ] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.researchPaper.count({ where: { status: "UPLOAD" } }),
      prisma.researchPaper.count({ where: { status: "ON_REVIEW" } }),
      prisma.researchPaper.count({ where: { status: "ON_EDIT" } }),
      prisma.researchPaper.count({ where: { status: "PUBLISH" } }),
      prisma.researchPaper.count({ where: { status: "REJECTED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { userType: "REVIEWER" } }),
      prisma.user.count({ where: { userType: "EDITOR" } })
    ]);

    let userSpecificStats = {};

    if (userId && userType) {
      switch (userType) {
        case "USER":
          const [authoredPapers, authoredPublished] = await Promise.all([
            prisma.researchPaper.count({ where: { authorId: userId } }),
            prisma.researchPaper.count({ 
              where: { 
                authorId: userId, 
                status: "PUBLISH" 
              } 
            })
          ]);
          userSpecificStats = { authoredPapers, authoredPublished };
          break;

        case "REVIEWER":
          const [assignedForReview, reviewsCompleted] = await Promise.all([
            prisma.researchPaper.count({ where: { reviewerId: userId } }),
            prisma.researchPaper.count({ 
              where: { 
                reviewerId: userId, 
                reviewerStatus: { in: ["ACCEPTED_FOR_PUBLICATION", "REJECTED_FOR_PUBLICATION"] }
              } 
            })
          ]);
          userSpecificStats = { assignedForReview, reviewsCompleted };
          break;

        case "EDITOR":
          const [assignedForEdit, editsCompleted] = await Promise.all([
            prisma.researchPaper.count({ where: { editorId: userId } }),
            prisma.researchPaper.count({ 
              where: { 
                editorId: userId, 
                editorStatus: { in: ["ACCEPTED_FOR_PUBLICATION", "REJECTED_FOR_PUBLICATION"] }
              } 
            })
          ]);
          userSpecificStats = { assignedForEdit, editsCompleted };
          break;
      }
    }

    return NextResponse.json({
      overall: {
        totalPapers,
        uploadedPapers,
        underReviewPapers,
        underEditPapers,
        publishedPapers,
        rejectedPapers,
        totalUsers,
        totalReviewers,
        totalEditors
      },
      userSpecific: userSpecificStats
    });

  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
