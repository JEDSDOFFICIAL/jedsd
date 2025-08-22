import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userType = session.user.userType;
    const userId = session.user.id;

    // Fetch all necessary data
    const [papers, reviews, users] = await Promise.all([
      prisma.researchPaper.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          submissionDate: 'desc',
        },
      }),
      prisma.paperReview.findMany({
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          paper: {
            select: {
              id: true,
              title: true,
              submissionDate: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          createdAt: true,
          isVerified: true,
        },
      }),
    ]);

    // Calculate user-specific stats based on role
    let userStats = {};
    
    if (userType === "USER") {
      const userPapers = papers.filter(p => p.authorId === userId);
      userStats = {
        totalPapers: userPapers.length,
        acceptedPapers: userPapers.filter(p => p.status === "ACCEPTED").length,
        publishedPapers: userPapers.filter(p => p.status === "PUBLISH").length,
        rejectedPapers: userPapers.filter(p => p.status === "REJECTED").length,
        inReviewPapers: userPapers.filter(p => p.status === "ON_REVIEW").length,
      };
    } else if (userType === "REVIEWER") {
      const userReviews = reviews.filter(r => r.reviewerId === userId);
      userStats = {
        totalAssignedReviews: userReviews.length,
        completedReviews: userReviews.filter(r => 
          r.reviewerStatus === "ACCEPTED_FOR_PUBLICATION" || 
          r.reviewerStatus === "REJECTED_FOR_PUBLICATION"
        ).length,
        pendingReviews: userReviews.filter(r => r.reviewerStatus === "PENDING").length,
        averageRating: userReviews.length > 0 
          ? userReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / userReviews.length 
          : 0,
      };
    } else if (userType === "EDITOR") {
      userStats = {
        papersToAllocate: papers.filter(p => p.status === "UPLOAD").length,
        papersInReview: papers.filter(p => p.status === "ON_REVIEW").length,
        papersCompleted: papers.filter(p => 
          p.status === "ACCEPTED" || p.status === "REJECTED" || p.status === "PUBLISH"
        ).length,
        totalPapersManaged: papers.length,
      };
    } else if (userType === "ADMIN") {
      userStats = {
        totalUsers: users.length,
        totalPapers: papers.length,
        totalReviews: reviews.length,
        verifiedUsers: users.filter(u => u.isVerified).length,
        papersByStatus: papers.reduce((acc, paper) => {
          acc[paper.status] = (acc[paper.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        usersByType: users.reduce((acc, user) => {
          acc[user.userType] = (acc[user.userType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    }

    // Calculate overall system stats
    const overallStats = {
      totalPapers: papers.length,
      totalReviews: reviews.length,
      totalUsers: users.length,
      averageReviewsPerPaper: papers.length > 0 ? reviews.length / papers.length : 0,
      papersByStatus: papers.reduce((acc, paper) => {
        acc[paper.status] = (acc[paper.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      reviewsByStatus: reviews.reduce((acc, review) => {
        acc[review.reviewerStatus || 'UNKNOWN'] = (acc[review.reviewerStatus || 'UNKNOWN'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      monthlySubmissions: getMonthlySubmissions(papers),
      topReviewers: getTopReviewers(reviews),
      recentActivity: getRecentActivity(papers, reviews),
    };

    return NextResponse.json({
      success: true,
      data: {
        papers,
        reviews,
        users,
        userStats,
        overallStats,
        userType,
      },
    });

  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

function getMonthlySubmissions(papers: any[]) {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthPapers = papers.filter(paper => {
      const paperDate = new Date(paper.submissionDate);
      return paperDate.getMonth() === date.getMonth() && 
             paperDate.getFullYear() === date.getFullYear();
    });
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      submissions: monthPapers.length,
    });
  }
  
  return months;
}

function getTopReviewers(reviews: any[]) {
  const reviewerStats = reviews.reduce((acc, review) => {
    const reviewerId = review.reviewerId;
    if (!acc[reviewerId]) {
      acc[reviewerId] = {
        id: reviewerId,
        name: review.reviewer.name,
        email: review.reviewer.email,
        count: 0,
        averageRating: 0,
        totalRating: 0,
      };
    }
    acc[reviewerId].count++;
    if (review.rating) {
      acc[reviewerId].totalRating += review.rating;
      acc[reviewerId].averageRating = acc[reviewerId].totalRating / acc[reviewerId].count;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(reviewerStats)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);
}

function getRecentActivity(papers: any[], reviews: any[]) {
  const recentPapers = papers
    .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .slice(0, 5)
    .map(paper => ({
      type: 'paper_submission',
      title: paper.title,
      author: paper.author?.name || 'Unknown',
      date: paper.submissionDate,
    }));

  const recentReviews = reviews
    .filter(review => review.reviewText && review.reviewText.trim() !== '')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map(review => ({
      type: 'review_submission',
      title: review.paper?.title || 'Unknown Paper',
      reviewer: review.reviewer?.name || 'Unknown',
      date: review.updatedAt,
    }));

  return [...recentPapers, ...recentReviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}
