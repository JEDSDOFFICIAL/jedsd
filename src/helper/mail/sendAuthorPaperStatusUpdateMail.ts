import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";
import { render } from '@react-email/components';
import AuthorPaperStatusUpdateEmail from "../../../emails/AuthorPaperStatusUpdateMail";

export async function sendAuthorPaperStatusUpdateMail(
  paper: ResearchPaper, 
  author: User, 
  newStatus: string,
  reviewerNotes?: string,
  editorNotes?: string
) {
  try {
    const emailHtml = await render(AuthorPaperStatusUpdateEmail({
      authorName: author.name,
      paperTitle: paper.title,
      newStatus: newStatus,
      reviewerNotes: reviewerNotes,
      editorNotes: editorNotes,
      dashboardUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`
    }));

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: author.email,
      subject: `JEDSD - Paper Status Update: ${paper.title}`,
      html: emailHtml,
    });

    return { success: true, message: "Author status update email sent successfully." };
  } catch (emailError) {
    console.error("Error sending author status update email:", emailError);
    return { success: false, message: "Failed to send author status update email." };
  }
}
