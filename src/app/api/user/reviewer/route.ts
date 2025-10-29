import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserType } from "@prisma/client";

// POST: Create a new UserDetails
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, userType } = body;

  if (!email || !Object.values(UserType).includes(userType)) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const existing = await prisma.userDetails.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const entry = await prisma.userDetails.create({
      data: { email, userType },
    });

    return NextResponse.json({entry,message:"New User Created Successfully"}, { status: 200});
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete one or multiple UserDetails by email(s)
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { emails } = body;

  if (!emails || (typeof emails !== "string" && !Array.isArray(emails))) {
    return NextResponse.json({ message: "Invalid email(s) provided" }, { status: 400 });
  }

  try {
    let result;

    if (Array.isArray(emails)) {
      result = await prisma.userDetails.deleteMany({
        where: { email: { in: emails } },
      });
    } else {
      result = await prisma.userDetails.delete({
        where: { email: emails },
      });
    }

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// GET: Return all UserDetails
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where:{
        userType: { in: [UserType.REVIEWER, UserType.ADMIN, UserType.EDITOR] }
      },
      include: {
        reviews: {
          select: {
            id: true,
            reviewerStatus: true,
            rating: true,
            reviewText: true
          }
        }
      }
    });

    // Calculate basic stats for each user
    const usersWithStats = users.map(user => {
      const reviews = user.reviews || [];
      const completedReviews = reviews.filter(r => r.reviewText && r.reviewText.trim() !== '');
      const activeReviews = reviews.filter(r => 
        r.reviewerStatus === 'PENDING' || 
        r.reviewerStatus === 'ACCEPTED_FOR_REVIEW'
      );
      
      const ratingsGiven = completedReviews
        .map(r => r.rating)
        .filter(rating => rating !== null) as number[];
      
      const averageRating = ratingsGiven.length > 0 
        ? ratingsGiven.reduce((sum, rating) => sum + rating, 0) / ratingsGiven.length 
        : 0;

      return {
        ...user,
        reviews: undefined, // Remove the detailed reviews from the response
        stats: {
          activeReviews: activeReviews.length,
          completedReviews: completedReviews.length,
          averageRating: averageRating,
          expertise: user.areaOfInterest || []
        }
      };
    });

    return NextResponse.json(usersWithStats, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update UserDetails (and User if exists)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { email, userType } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Invalid email provided" }, { status: 400 });
  }

  if (!Object.values(UserType).includes(userType)) {
    return NextResponse.json({ message: "Invalid user type provided" }, { status: 400 });
  }

  try {
    const userDetailsExists = await prisma.userDetails.findUnique({ where: { email } });

    if (!userDetailsExists) {
      return NextResponse.json({ message: "UserDetails not found" }, { status: 404 });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      await prisma.user.update({
        where: { email },
        data: { userType },
      });
    }

    const result = await prisma.userDetails.update({
      where: { email },
      data: { userType },
    });

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
