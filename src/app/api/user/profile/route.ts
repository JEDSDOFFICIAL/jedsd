import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/user/profile
 * Fetch user profile data
 * Query params: email (optional - defaults to session user)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email") || session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        affiliation: true,
        areaOfInterest: true,
        profileImage: true,
        userType: true,
        variableUserType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            authoredPapers: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile data
 * Body: { email, name?, bio?, affiliation?, areaOfInterest?, profileImage? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, name, bio, affiliation, areaOfInterest, profileImage } = body;

    // Only allow users to update their own profile (unless admin)
    const requestingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { userType: true },
    });

    if (
      email !== session.user.email &&
      requestingUser?.userType !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You can only update your own profile" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (affiliation !== undefined) updateData.affiliation = affiliation;
    if (areaOfInterest !== undefined) updateData.areaOfInterest = areaOfInterest;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        affiliation: true,
        areaOfInterest: true,
        profileImage: true,
        userType: true,
        variableUserType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/profile
 * Complete profile setup (for new users)
 * Body: { email, name, bio?, affiliation?, areaOfInterest?, profileImage? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, name, bio, affiliation, areaOfInterest, profileImage } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        bio: bio || null,
        affiliation: affiliation || null,
        areaOfInterest: areaOfInterest || [],
        profileImage: profileImage || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        affiliation: true,
        areaOfInterest: true,
        profileImage: true,
        userType: true,
        variableUserType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile setup completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error completing profile setup:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
