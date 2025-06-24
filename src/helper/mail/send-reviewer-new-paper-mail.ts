import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";

import ReviewerAllocationEmail from "../../../emails/reviewerAllocationMail";


export async function sendReviewerPaperMail(paper: ResearchPaper, reviewer: User) {
  try {
   
    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: reviewer.email,
      subject: "JEDSD successful new paper upload mail to reviewer",
      react: ReviewerAllocationEmail({ paper, reviewer }),
    });

    return { success: true, message: "Upload success email sent to reviewer." };
  } catch (emailError) {
    console.error("Error sending upload email:", emailError);
    return { success: false, message: "Failed to send upload email." };
  }
}
