import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/mailer";
import { z } from "zod";
import EditorDecisionEmail from "../../../../../emails/EditorDecisionMail";

const sendEmailSchema = z.object({
  recipients: z.array(z.string().email()).min(1, "At least one recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  // reviewerComments forwarded to the author
  message: z.string().min(1, "Message is required"),
  paperInfo: z
    .object({
      paperId: z.string(),
      title: z.string(),
    })
    .optional(),
  // Extra fields the client may send for richer email rendering
  reviewerName: z.string().optional(),
  reviewerRating: z.number().nullable().optional(),
  reviewerStatus: z.string().nullable().optional(),
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

    // Only editors and admins can send decision emails
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.userType !== "EDITOR" && user.userType !== "ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Access denied. Editor privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email data",
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { recipients, subject, message, paperInfo, reviewerName, reviewerStatus } =
      validation.data;

    const baseUrl = process.env.NEXTAUTH_URL || "https://jedsd.com";
    const paperUrl = paperInfo
      ? `${baseUrl}/paper/${paperInfo.paperId}`
      : `${baseUrl}/dashboard`;
    const dashboardUrl = `${baseUrl}/dashboard`;

    // Map reviewerStatus to a valid EditorDecision value for the email template.
    // We use MINOR_REVISION as a neutral default when this is a plain reviewer forward.
    const decisionMap: Record<string, "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT"> = {
      ACCEPTED_FOR_PUBLICATION: "ACCEPT",
      MINOR_REVISION: "MINOR_REVISION",
      MAJOR_REVISION: "MAJOR_REVISION",
      REJECTED_FOR_PUBLICATION: "REJECT",
    };
    const mappedDecision: "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT" =
      decisionMap[reviewerStatus ?? ""] ?? "MINOR_REVISION";

    // Build the email using the existing EditorDecisionEmail template.
    // We put the reviewer's author-facing comments in `reviewerComments`
    // and keep editorComments as a brief forwarding note.
    const emailComponent = EditorDecisionEmail({
      pocName: "Author",           // generic salutation; author name not available here
      editorName: user.name,
      paperTitle: paperInfo?.title ?? "Your Manuscript",
      authorName: "Author",
      decision: mappedDecision,
      editorComments: `The editor is forwarding the following reviewer comments to assist you in addressing the review feedback.`,
      reviewerComments: `${reviewerName ? `From ${reviewerName}:\n\n` : ""}${message}`,
      paperUrl,
      dashboardUrl,
    });

    const mailResult = await resend.emails.send({
      from: `JEDSD Editorial <${process.env.NEXT_ENV_FROM_MAIL}>`,
      to: recipients,
      subject,
      react: emailComponent,
    });

    if (mailResult.error) {
      console.error("Resend error:", mailResult.error);
      return NextResponse.json(
        { success: false, message: "Email provider error", error: mailResult.error.message },
        { status: 502 }
      );
    }

    console.log("Editor send-email: sent to", recipients, "| paper:", paperInfo?.paperId);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      recipients: recipients.length,
      messageId: mailResult.data?.id,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}
