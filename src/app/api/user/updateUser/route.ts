import { NextResponse } from "next/server";
import { PrismaClient, UserType } from "@prisma/client";
import { z } from "zod";
import { syncUserDetails } from "@/lib/userDetailsUtils";

const prisma = new PrismaClient();

// Schema for updating user
const updateUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID format."),
  name: z.string().min(1, "Name is required.").optional(),
  email: z.string().email("Invalid email format.").optional(),
  affiliation: z.string().optional(),
  profileImage: z.string().url("Invalid profile image URL.").optional(),
  userType: z.enum(["USER", "REVIEWER", "EDITOR", "ADMIN"]).optional(),
  isVerified: z.boolean().optional(),
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

    const { userId, userType, email, ...updateData } = validationResult.data;

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

    // If email is being updated, check for uniqueness
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already exists." },
          { status: 400 }
        );
      }
    }

    // Handle UserDetails logic for role changes using utility
    if (userType && userType !== existingUser.userType) {
      const finalEmail = email || existingUser.email;
      
      // Use the utility function to sync UserDetails
      const syncResult = await syncUserDetails(finalEmail, userType as UserType);
      
      if (!syncResult.success) {
        return NextResponse.json(
          { success: false, message: "Failed to sync user role." },
          { status: 500 }
        );
      }
    }

    // Update the user (userType will be updated by syncUserDetails if needed)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        ...(email && { email }),
        // Don't update userType here as it's handled by syncUserDetails
      }
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
