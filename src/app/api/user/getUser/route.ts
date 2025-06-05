import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserType } from "@prisma/client";
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const userType = searchParams.get("userType");

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit")||"5");
  const skip = (page - 1) * limit;

  try {
    let users;
    if (email) {
      users=await prisma.user.findUnique({
        where: { email },
      });

      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(users);
    }
    if (userType) {
      // Import UserType enum from your Prisma client
      
      users = await prisma.user.findMany({
        where: { userType: userType as UserType }, // Replace 'any' with 'UserType' if you import the enum
      });

      if (!users || users.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(users);
    }

    users=await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.user.count();

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit), 
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
