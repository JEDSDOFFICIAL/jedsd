import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileToFirebase } from "@/lib/Firebase-Action";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    if (!path) {
      return NextResponse.json(
        { success: false, message: "Upload path not provided." },
        { status: 400 }
      );
    }

    // Upload file to Firebase
    const uploadedUrl = await uploadFileToFirebase(file, path);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully.",
      url: uploadedUrl,
    });

  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error occurred while uploading file.", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
