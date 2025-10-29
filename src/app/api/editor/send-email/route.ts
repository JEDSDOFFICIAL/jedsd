import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const sendEmailSchema = z.object({
  recipients: z.array(z.string().email()),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  paperInfo: z.object({
    paperId: z.string(),
    title: z.string(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is editor or admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.userType !== 'EDITOR' && user.userType !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: "Access denied. Editor privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email data", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { recipients, subject, message, paperInfo } = validation.data;

    // TODO: Implement actual email sending logic here
    // This is a placeholder implementation
    // You would integrate with your email service (SendGrid, AWS SES, etc.)
    
    console.log("Sending email to:", recipients);
    console.log("Subject:", subject);
    console.log("Message:", message);
    if (paperInfo) {
      console.log("Related paper:", paperInfo);
    }

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    // You could store email logs in the database
    // await prisma.emailLog.create({
    //   data: {
    //     senderId: user.id,
    //     recipients: recipients,
    //     subject: subject,
    //     message: message,
    //     paperInfo: paperInfo,
    //     sentAt: new Date(),
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      recipients: recipients.length,
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}