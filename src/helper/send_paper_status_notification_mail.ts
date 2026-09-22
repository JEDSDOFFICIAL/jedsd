/**
 * Sends a status notification to the author (used for ACCEPTED, REJECTED, etc.)
 * Wires up the existing PaperStatusNotificationMail template.
 */

import { resend } from "@/lib/mailer";
import { ResearchPaper } from "@prisma/client";

interface SendPaperStatusNotificationMailProps {
  paper: ResearchPaper;
  recipientEmails: string[];
  status: "ACCEPTED" | "REJECTED" | "REVISION_REQUESTED" | "REVISION_SUBMITTED" | "PUBLISH";
  message?: string;
}

const statusConfig: Record<string, { subject: string; color: string; label: string }> = {
  ACCEPTED: {
    subject: "Your Manuscript Has Been Accepted",
    color: "#22c55e",
    label: "Accepted for Publication",
  },
  REJECTED: {
    subject: "Manuscript Decision: Not Accepted",
    color: "#ef4444",
    label: "Not Accepted",
  },
  REVISION_REQUESTED: {
    subject: "Revision Required for Your Manuscript",
    color: "#f59e0b",
    label: "Revision Required",
  },
  REVISION_SUBMITTED: {
    subject: "Revision Received — Under Editorial Review",
    color: "#3b82f6",
    label: "Revision Under Review",
  },
  PUBLISH: {
    subject: "Your Manuscript Has Been Published",
    color: "#6366f1",
    label: "Published",
  },
};

export const sendPaperStatusNotificationMail = async ({
  paper,
  recipientEmails,
  status,
  message,
}: SendPaperStatusNotificationMailProps) => {
  const config = statusConfig[status] ?? {
    subject: `Manuscript Status Update: ${status}`,
    color: "#64748b",
    label: status,
  };

  try {
    const result = await resend.emails.send({
      from: `JEDSD Editorial Office <${process.env.NEXT_ENV_FROM_MAIL}>`,
      to: recipientEmails,
      subject: `${config.subject} — ${paper.paperId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e293b; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Manuscript Status Update</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0;">JEDSD Journal of Engineering and Data Science</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <div style="background: ${config.color}; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; text-align: center; font-weight: bold; font-size: 18px;">
              ${config.label}
            </div>
            <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Manuscript Details</p>
              <p style="margin: 0; color: #64748b;"><strong>ID:</strong> ${paper.paperId}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${message ? `
            <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Message from the Editor</p>
              <p style="color: #334155; white-space: pre-wrap;">${message}</p>
            </div>
            ` : ""}
            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/author" style="background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                View in Dashboard
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px;">JEDSD Editorial Management System</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (err) {
    console.error("sendPaperStatusNotificationMail error:", err);
    throw err;
  }
};
