import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";

export async function sendPointOfContactNotificationMail(
  paper: ResearchPaper, 
  pointOfContact: { name: string; email: string; phone?: string },
  notificationType: 'SUBMISSION' | 'STATUS_UPDATE' | 'REVIEW_COMPLETE' | 'PUBLICATION',
  additionalMessage?: string
) {
  try {
    const typeMessages = {
      SUBMISSION: "Your paper has been successfully submitted to JEDSD.",
      STATUS_UPDATE: "There has been a status update on your paper.",
      REVIEW_COMPLETE: "The review process for your paper has been completed.",
      PUBLICATION: "Your paper has been published in JEDSD!"
    };

    const typeMessage = typeMessages[notificationType] || "There has been an update regarding your paper.";

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: pointOfContact.email,
      subject: `JEDSD - ${notificationType.replace('_', ' ').toLowerCase()}: ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Point of Contact Notification</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Dear ${pointOfContact.name},
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              As the point of contact for this paper, we are notifying you of the following update:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Paper Details:</h3>
              <p style="margin: 8px 0;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> ${paper.status}</p>
              <p style="margin: 8px 0;"><strong>Submission Date:</strong> ${new Date(paper.submissionDate).toLocaleDateString()}</p>
              <p style="margin: 8px 0;"><strong>Paper ID:</strong> ${paper.id}</p>
            </div>
            
            <div style="background-color: ${notificationType === 'PUBLICATION' ? '#d4edda' : '#d1ecf1'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${notificationType === 'PUBLICATION' ? '#28a745' : '#17a2b8'};">
              <p style="margin: 0; color: ${notificationType === 'PUBLICATION' ? '#155724' : '#0c5460'};">
                <strong>Update:</strong> ${typeMessage}
              </p>
            </div>
            
            ${additionalMessage ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Additional Information:</strong> ${additionalMessage}
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/paper/${paper.id}" 
                 style="background-color: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Paper Details
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or concerns, please contact our support team.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message from JEDSD. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });

    return { success: true, message: "Point of contact notification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending point of contact notification email:", emailError);
    return { success: false, message: "Failed to send point of contact notification email." };
  }
}
