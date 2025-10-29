// /api/auth/signup.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/hash";
import { z } from "zod";
import { sendVerificationMail } from "@/helper/send_Verification_Mail";
import { UserType } from "@prisma/client";

// Utility function to get effective user type
async function getEffectiveUserType(email: string): Promise<UserType> {
  try {
    // First, check UserDetails table
    const userDetails = await prisma.userDetails.findUnique({
      where: { email },
    });

    if (userDetails) {
      return userDetails.userType;
    }

    // If not found in UserDetails, check User table
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user.userType;
    }

    // Default to AUTHOR if no record exists
    return UserType.AUTHOR;
  } catch (error) {
    console.error("Error fetching effective user type:", error);
    return UserType.AUTHOR;
  }
}


const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^a-zA-Z0-9]/),
});

export async function POST(req: Request) {
    
  const body = await req.json();

  const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    if (!name || !email || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }
        

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    if (existingUser.password && await comparePassword(password, existingUser.password)) {
      // handle case if password matches (add your logic here)
      return NextResponse.json({ message: "Already registered, logged in." });
    }
  }

  // Get the effective userType for this email using utility function
  const userType = await getEffectiveUserType(email);

  const hashedPassword = await hashPassword(password);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.create({
    data: {
      email,
      name: name.trim(),
      password: hashedPassword,
      profileImage:"/profileImage.png",
      isVerified: false,
      userType: userType, // Set the correct userType based on UserDetails
      verificationCode: otp,
      verificationCodeExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    variableUserType: userType, // Initialize variableUserType to the same value
    },
  });

  await sendVerificationMail({email,otp,name:name});

  return NextResponse.json({ 
    message: "Verification email sent",
    userType: userType // Optionally return the assigned userType
  });
}
