/**
 * Sends a publication confirmation to the author when the paper is published.
 * Wires up the existing PaperPublicationMail template.
 */

import { resend } from "@/lib/mailer";
import { ResearchPaper } from "@prisma/client";

interface SendPaperPublicationMailProps {
  paper: ResearchPaper;
  recipientEmails: string[];
}

export const sendPaperPublicationMail = async ({
  paper,
  recipientEmails,
}: SendPaperPublicationMailProps) => {
  const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : null;

  try {
    const result = await resend.emails.send({
      from: `JEDSD Editorial Office <${process.env.NEXT_ENV_FROM_MAIL}>`,
      to: recipientEmails,
      subject: `Your Manuscript Has Been Published — ${paper.paperId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e293b; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🎉 Congratulations — Your Paper is Published!</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0;">JEDSD Journal of Engineering and Data Science</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="color: #334155; font-size: 16px;">Dear Author,</p>
            <p style="color: #334155;">We are delighted to inform you that your manuscript has been published in the JEDSD Journal.</p>

            <div style="background: white; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Publication Details</p>
              <p style="margin: 0; color: #64748b;"><strong>Manuscript ID:</strong> ${paper.paperId}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;"><strong>Publication Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${paper.doi ? `<p style="margin: 4px 0 0 0; color: #64748b;"><strong>DOI:</strong> <a href="${doiUrl}" style="color: #6366f1;">${paper.doi}</a></p>` : ""}
            </div>

            <div style="margin: 24px 0; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/paper/${paper.paperId}" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                View Published Article
              </a>
            </div>

            <p style="color: #334155;">Your article is now publicly accessible and indexed. We thank you for your contribution to the JEDSD journal.</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 12px;">JEDSD Editorial Management System. ISSN: 2940-3383</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (err) {
    console.error("sendPaperPublicationMail error:", err);
    throw err;
  }
};
