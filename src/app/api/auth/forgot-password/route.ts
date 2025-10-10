import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

import crypto from "crypto";
import { sendPasswordResetEmail } from "@/helper/send_password_reset_mail";


const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: "If an account with this email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    await sendPasswordResetEmail({
      otp: resetToken,
      name: user.name || "User",
      email: user.email,
    });

    return NextResponse.json({
      message: "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
