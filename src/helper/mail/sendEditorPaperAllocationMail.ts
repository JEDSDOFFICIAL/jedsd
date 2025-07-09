import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";
import { render } from '@react-email/components';
import EditorPaperAllocationEmail from "../../../emails/EditorPaperAllocationMail";

export async function sendEditorPaperAllocationMail(paper: ResearchPaper, editor: User) {
  try {
    const emailHtml = await render(EditorPaperAllocationEmail({
      editorName: editor.name,
      paperTitle: paper.title,
      paperAbstract: paper.abstract,
      authorName: (paper as any).author?.name || 'Author',
      submissionDate: new Date(paper.submissionDate).toLocaleDateString(),
      reviewerStatus: (paper as any).reviewerStatus || 'Pending',
      editUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/edit/${paper.id}`
    }));

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: editor.email,
      subject: "JEDSD - New Paper Assignment for Editing",
      html: emailHtml,
    });

    return { success: true, message: "Editor allocation email sent successfully." };
  } catch (emailError) {
    console.error("Error sending editor allocation email:", emailError);
    return { success: false, message: "Failed to send editor allocation email." };
  }
}
