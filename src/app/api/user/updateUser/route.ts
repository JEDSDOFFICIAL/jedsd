import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, userType, name, position } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { message: "Invalid email provided" },
      { status: 400 }
    );
  }

  try {
    // Update userType in both userDetails and user tables (if provided)
    if (userType) {
      await prisma.userDetails.updateMany({
        where: { email },
        data: { userType },
      });

      await prisma.user.updateMany({
        where: { email },
        data: { userType },
      });
    }

    // Build update object for user
    const userUpdateData: Record<string, any> = {};
    if (name) userUpdateData.name = name;
    if (position) userUpdateData.position = position;

    let result = null;
    if (Object.keys(userUpdateData).length > 0) {
      result = await prisma.user.update({
        where: { email },
        data: userUpdateData,
      });
    }

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
