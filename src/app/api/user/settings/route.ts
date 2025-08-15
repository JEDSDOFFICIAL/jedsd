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
    const { 
      emailNotifications, 
      paperUpdateAlerts, 
      reviewReminders, 
      darkMode, 
      publicProfile, 
      twoFactorAuth 
    } = body;

    // In a real app, you'd save these to a UserSettings table
    // For now, we'll just return success
    console.log("Saving settings for user:", session.user.id, body);

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: body
    });

  } catch (error) {
    console.error("Error updating settings:", error);
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

    // In a real app, you'd fetch from a UserSettings table
    // For now, return default settings
    const defaultSettings = {
      emailNotifications: true,
      paperUpdateAlerts: true,
      reviewReminders: true,
      darkMode: false,
      publicProfile: false,
      twoFactorAuth: false,
    };

    return NextResponse.json({ settings: defaultSettings });

  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
