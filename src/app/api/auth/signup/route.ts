import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/hash";
import { z } from "zod";
import { sendVerificationMail } from "@/helper/send_Verification_Mail";
import { UserType } from "@prisma/client";
import { getEffectiveUserType } from "@/lib/auth";

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
    return NextResponse.json({ error: "Email already registered." }, { status: 400 });
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
