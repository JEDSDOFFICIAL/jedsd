import { NextResponse } from "next/server";
import { PrismaClient, UserType } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for updating user
const updateUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID format."),
  name: z.string().min(1, "Name is required.").optional(),
  affiliation: z.string().optional(),
  profileImage: z.string().url("Invalid profile image URL.").optional(),
  userType: z.enum(["AUTHOR", "REVIEWER", "EDITOR", "ADMIN"]).optional(),
  originalUserType: z.enum(["AUTHOR", "REVIEWER", "EDITOR", "ADMIN"]).optional(),
  isVerified: z.boolean().optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters.").optional(),
  areaOfInterest: z.array(z.string()).optional(),
});

// POST /api/user/updateUser - Update user details
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = updateUserSchema.safeParse(body);

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

    const { userId, ...updateData } = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Remove sensitive information from response
    const { password, resetToken, verificationCode, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      data: safeUser
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
