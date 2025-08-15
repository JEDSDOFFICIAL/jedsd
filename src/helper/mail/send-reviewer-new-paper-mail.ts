import { resend } from "@/lib/mailer";
import { ResearchPaper, User } from "@prisma/client";
import { render } from '@react-email/components';
import ReviewerNewPaperEmail from "../../../emails/ReviewerNewPaperMail";

export async function sendReviewerPaperMail(paper: ResearchPaper, reviewer: User) {
  try {
    const emailHtml = await render(ReviewerNewPaperEmail({
      reviewerName: reviewer.name,
      paperTitle: paper.title,
      paperAbstract: paper.abstract,
      authorName: (paper as any).author?.name || 'Author',
      submissionDate: new Date(paper.submissionDate).toLocaleDateString(),
      reviewUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/review/${paper.id}`
    }));

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: reviewer.email,
      subject: "JEDSD - New Paper Assignment for Review",
      html: emailHtml,
    });

    return { success: true, message: "Paper assignment email sent to reviewer." };
  } catch (emailError) {
    console.error("Error sending reviewer assignment email:", emailError);
    return { success: false, message: "Failed to send reviewer assignment email." };
  }
}
