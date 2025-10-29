import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const inviteReviewerSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is editor or admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.userType !== 'EDITOR' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: "Access denied. Editor privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = inviteReviewerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email provided", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // If user exists, update their type to include reviewer
      if (existingUser.userType === 'REVIEWER') {
        return NextResponse.json(
          { success: false, message: "User is already a reviewer" },
          { status: 400 }
        );
      }

      // Update user to have reviewer privileges
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { userType: 'REVIEWER' }
      });

      return NextResponse.json({
        success: true,
        message: "User updated to reviewer successfully",
        user: updatedUser
      });
    } else {
      // Create a user entry for invitation (they'll complete registration later)
      const userDetails = await prisma.userDetails.create({
        data: {
          email,
          userType: 'REVIEWER'
        }
      });

      // Here you would typically send an invitation email
      // For now, we'll just return success

      return NextResponse.json({
        success: true,
        message: "Reviewer invitation sent successfully",
        userDetails
      });
    }

  } catch (error: any) {
    console.error("Error inviting reviewer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to invite reviewer", error: error.message },
      { status: 500 }
    );
  }
}