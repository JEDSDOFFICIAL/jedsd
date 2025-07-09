import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userType = searchParams.get("userType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    
    if (!userType) {
      return NextResponse.json(
        { message: "userType parameter is required" },
        { status: 400 }
      );
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userType: userType
    };

    // Get users with pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        affiliation: true,
        profileImage: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
