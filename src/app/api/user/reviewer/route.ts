import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, userType, name } = body;

  if (!email || !["REVIEWER", "ADMIN"].includes(userType) || !name) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const trimmedName = name.toLowerCase().trim();

  try {
    const existing = await prisma.userDetails.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { message: "User with this name already exists" },
        { status: 409 }
      );
    }

    const entry = await prisma.userDetails.create({
      data: { email, userType, name: trimmedName },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}



export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const { emails } = body;

  if (!emails || (typeof emails !== "string" && !Array.isArray(emails))) {
    return NextResponse.json({ message: "Invalid email(s) provided" }, { status: 400 });
  }

  try {
    let result;

    if (Array.isArray(emails)) {
      // Delete multiple users
      result = await prisma.userDetails.deleteMany({
        where: {
          email: {
            in: emails,
          },
        },
      });
    } else {
      // Delete a single user
      result = await prisma.userDetails.delete({
        where: {
          email: emails,
        },
      });
    }

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



export async function GET() {


  try {
    const data = await prisma.userDetails.findMany();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}




export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const { email, userType ,name} = body;
  const normalizedName = name.toLowerCase().trim();
  if (!email || (typeof email !== "string" )) {
    return new Response(JSON.stringify({ message: "Invalid email(s) provided" }), { status: 400 });
  }

  if (userType !== "USER" && userType !== "REVIWER"&& userType !== "ADMIN") {
    return new Response(JSON.stringify({ message: "Invalid user type provided" }), { status: 400 });
  }

  try {

    
    const  result = await prisma.userDetails.update({
        where: { email },
        data: { userType, name: normalizedName },
      });
    await prisma.user.update({
      where: { email },
      data: { userType, name: normalizedName },
    });

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}