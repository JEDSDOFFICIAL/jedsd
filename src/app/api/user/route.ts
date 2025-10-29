import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserType } from "@prisma/client";



export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const userType = searchParams.get("userType");
  console.log("email is ", email);
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

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType") as UserType | null;
    const name = searchParams.get("name");
    const affiliation = searchParams.get("affiliation");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (userType) updateData.userType = userType;
    if (name) updateData.name = name;
    if (affiliation) updateData.affiliation = affiliation;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    if (userType){
      await prisma.userDetails.update({
        where:{
          id:userId
        },

        data:{
          userType:userType
        }
      })
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });

    return NextResponse.json({
      message: `Successfully deleted ${userIds.length} user(s)`
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
