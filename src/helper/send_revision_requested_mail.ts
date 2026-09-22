/**
 * Sends a notification to the author when the editor requests a revision.
 */

import { resend } from "@/lib/mailer";
import { ResearchPaper, EditorDecision } from "@prisma/client";

interface SendRevisionRequestedMailProps {
  paper: ResearchPaper;
  recipientEmails: string[];
  editorComments: string;
  decision: EditorDecision;
  roundNumber: number;
}

const decisionLabel: Record<EditorDecision, string> = {
  ACCEPT: "Accept",
  MINOR_REVISION: "Minor Revision Required",
  MAJOR_REVISION: "Major Revision Required",
  REJECT: "Reject",
};

export const sendRevisionRequestedMail = async ({
  paper,
  recipientEmails,
  editorComments,
  decision,
  roundNumber,
}: SendRevisionRequestedMailProps) => {
  try {
    const result = await resend.emails.send({
      from: `JEDSD Editorial Office <${process.env.NEXT_ENV_FROM_MAIL}>`,
      to: recipientEmails,
      subject: `Revision Required: ${paper.title} (${paper.paperId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e293b; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Revision Request</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0;">JEDSD Journal of Engineering and Data Science</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="color: #334155; font-size: 16px;">Dear Author,</p>
            <p style="color: #334155;">Following a review of your manuscript, the Editor has requested a revision.</p>

            <div style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Manuscript Details</p>
              <p style="margin: 0; color: #64748b;"><strong>ID:</strong> ${paper.paperId}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Review Round:</strong> ${roundNumber}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Decision:</strong> ${decisionLabel[decision]}</p>
            </div>

            <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Editor's Comments</p>
              <p style="color: #334155; white-space: pre-wrap;">${editorComments}</p>
            </div>

            <p style="color: #334155;">Please log in to the JEDSD platform to submit your revised manuscript along with:</p>
            <ul style="color: #334155;">
              <li>Revised manuscript (PDF / DOCX)</li>
              <li>Cover letter addressing the editor's comments</li>
              <li>Response to reviewers document</li>
              <li>LaTeX source files (if applicable)</li>
            </ul>
            <p style="color: #64748b; font-size: 14px;">
              <strong>Important:</strong> Your revised files will be submitted directly to the Editor and will not be shared with reviewers automatically.
            </p>
            <div style="margin: 24px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/author" style="background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px;">This is an automated message from the JEDSD Editorial Management System. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (err) {
    console.error("sendRevisionRequestedMail error:", err);
    throw err;
  }
};
