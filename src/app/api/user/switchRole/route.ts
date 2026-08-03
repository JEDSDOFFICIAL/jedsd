import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Zod schema for input validation
const switchRoleSchema = z.object({
  newRole: z.enum(["AUTHOR", "REVIEWER", "EDITOR", "ADMIN"]),
});

// Define allowed role transitions
const ROLE_SWITCHING_RULES: Record<string, string[]> = {
  ADMIN: ["AUTHOR", "REVIEWER", "EDITOR"], // Admin can switch to any role
  AUTHOR: [], // Author cannot switch roles
  REVIEWER: ["AUTHOR"], // Reviewer can switch to Author
  EDITOR: ["AUTHOR", "REVIEWER"], // Editor can switch to Author or Reviewer
};

// POST /api/user/switchRole — Switch role
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log(body);
    
    const parsed = switchRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
          errors: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const { newRole } = parsed.data;

    // Find the user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const baseRole = currentUser.userType; // permanent/original
    const currentRole = currentUser.variableUserType ? currentUser.variableUserType : currentUser.userType; // currently active

    // Get roles user can switch to based on base role
    const allowedRoles = ROLE_SWITCHING_RULES[baseRole] || [];

    // Always allow switching back to the base/original role
    if (currentRole !== baseRole && !allowedRoles.includes(baseRole)) {
      allowedRoles.push(baseRole);
    }

    // Check permission
    if (!allowedRoles.includes(newRole)) {
      return NextResponse.json(
        {
          success: false,
          message: `Role switch to ${newRole} is not allowed for ${baseRole}.`,
        },
        { status: 403 }
      );
    }

    // Update variableUserType (active role)
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { variableUserType: newRole },
    });
    // Note: Session will be updated on next request through JWT callback
    const { password, resetToken, verificationCode, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: `Role successfully switched to ${newRole}.`,
      data: safeUser,
    });
  } catch (error) {
    console.error("Error switching role:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
