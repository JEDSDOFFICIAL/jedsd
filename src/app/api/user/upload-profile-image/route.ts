import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import  storage  from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * POST /api/user/upload-profile-image
 * Upload a profile image to Firebase Storage
 * Body: FormData with profileImage file and email
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

    const formData = await req.formData();
    const file = formData.get("profileImage") as File;
    const email = formData.get("email") as string || session.user.email;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Only allow users to update their own profile image (unless admin)
    const requestingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { userType: true, id: true },
    });

    if (email !== session.user.email && requestingUser?.userType !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: You can only update your own profile image" },
        { status: 403 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `profile-images/${email.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.${fileExtension}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, fileName);
    const metadata = {
      contentType: file.type,
    };

    await uploadBytes(storageRef, buffer, metadata);
    const downloadURL = await getDownloadURL(storageRef);

    // Update user profile image in database
    await prisma.user.update({
      where: { email },
      data: { profileImage: downloadURL },
    });

    return NextResponse.json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: downloadURL,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/upload-profile-image
 * Remove profile image
 * Query params: email (optional - defaults to session user)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email") || session.user.email;

    // Only allow users to delete their own profile image (unless admin)
    const requestingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { userType: true },
    });

    if (email !== session.user.email && requestingUser?.userType !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: You can only delete your own profile image" },
        { status: 403 }
      );
    }

    // Update user profile image to null in database
    await prisma.user.update({
      where: { email },
      data: { profileImage: null },
    });

    return NextResponse.json({
      success: true,
      message: "Profile image removed successfully",
    });
  } catch (error) {
    console.error("Error removing profile image:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
