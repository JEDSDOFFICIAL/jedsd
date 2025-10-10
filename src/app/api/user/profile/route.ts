import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, bio, affiliation, phone, expertise } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        affiliation: affiliation || undefined,
        // Add other fields as needed to your user schema
      }
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        affiliation: true,
        profileImage: true,
        // Add other profile fields as needed
      }
    });

    return NextResponse.json({ user });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
