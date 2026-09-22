/**
 * Sends a notification to the editorial team when an author submits a revision.
 * The editorial team email addresses are taken from environment variables.
 */

import { resend } from "@/lib/mailer";
import { ResearchPaper } from "@prisma/client";

interface SendRevisionSubmittedMailProps {
  paper: ResearchPaper;
  revisionNumber: number;
  authorName: string;
}

const EDITORIAL_EMAILS = [
  process.env.EDITORIAL_EMAIL_1 ?? "jedsdofficial@gmail.com",
  process.env.EDITORIAL_EMAIL_2 ?? "editorial@jedsd.com",
].filter(Boolean);

export const sendRevisionSubmittedToEditorMail = async ({
  paper,
  revisionNumber,
  authorName,
}: SendRevisionSubmittedMailProps) => {
  try {
    const result = await resend.emails.send({
      from: `JEDSD Editorial System <${process.env.NEXT_ENV_FROM_MAIL}>`,
      to: EDITORIAL_EMAILS,
      subject: `Revision ${revisionNumber} Submitted: ${paper.paperId} — ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e293b; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Revision Submitted</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0;">Editorial notification — JEDSD</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="color: #334155; font-size: 16px;">A revised manuscript has been submitted and is awaiting your editorial review.</p>

            <div style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Submission Details</p>
              <p style="margin: 0; color: #64748b;"><strong>Manuscript ID:</strong> ${paper.paperId}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Author:</strong> ${authorName}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Revision Number:</strong> ${revisionNumber}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Reminder:</strong> The revised files (manuscript, cover letter, source ZIP) are currently visible to the Editor only.
                Reviewers will NOT receive these files automatically. You must explicitly send the revision for review if needed.
              </p>
            </div>

            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/editor/revisions" style="background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Review Submission
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
    console.error("sendRevisionSubmittedToEditorMail error:", err);
    throw err;
  }
};
