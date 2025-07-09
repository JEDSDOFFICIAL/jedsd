import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";
import { render } from '@react-email/components';
import AdminPaperNotificationEmail from "../../../emails/AdminPaperNotificationMail";

export async function sendAdminPaperNotificationMail(paper: ResearchPaper, admin: User, action: string) {
  try {
    const emailHtml = await render(AdminPaperNotificationEmail({
      adminName: admin.name,
      paperTitle: paper.title,
      action: action,
      paperStatus: paper.status,
      submissionDate: new Date(paper.submissionDate).toLocaleDateString(),
      paperId: paper.id,
      dashboardUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`
    }));

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: admin.email,
      subject: `JEDSD - Admin Alert: ${action}`,
      html: emailHtml,
    });

    return { success: true, message: "Admin notification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending admin notification email:", emailError);
    return { success: false, message: "Failed to send admin notification email." };
  }
}
