import { resend } from "@/lib/mailer";

export async function sendContributorNotificationMail(
  paperTitle: string,
  contributor: { name: string; email: string; contribution: string },
  notificationType: 'SUBMISSION' | 'ACCEPTANCE' | 'REJECTION' | 'PUBLICATION',
  paperId: string,
  additionalMessage?: string
) {
  try {
    const typeMessages = {
      SUBMISSION: "A paper you contributed to has been submitted to JEDSD.",
      ACCEPTANCE: "Congratulations! A paper you contributed to has been accepted for publication.",
      REJECTION: "A paper you contributed to has been rejected.",
      PUBLICATION: "A paper you contributed to has been published!"
    };

    const typeMessage = typeMessages[notificationType] || "There has been an update regarding a paper you contributed to.";

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: contributor.email,
      subject: `JEDSD - Contributor Notification: ${paperTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Contributor Notification</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Dear ${contributor.name},
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              As a contributor to this paper, we wanted to notify you of the following update:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Paper Details:</h3>
              <p style="margin: 8px 0;"><strong>Title:</strong> ${paperTitle}</p>
              <p style="margin: 8px 0;"><strong>Your Contribution:</strong> ${contributor.contribution}</p>
              <p style="margin: 8px 0;"><strong>Paper ID:</strong> ${paperId}</p>
            </div>
            
            <div style="background-color: ${notificationType === 'ACCEPTANCE' || notificationType === 'PUBLICATION' ? '#d4edda' : notificationType === 'REJECTION' ? '#f8d7da' : '#d1ecf1'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${notificationType === 'ACCEPTANCE' || notificationType === 'PUBLICATION' ? '#28a745' : notificationType === 'REJECTION' ? '#dc3545' : '#17a2b8'};">
              <p style="margin: 0; color: ${notificationType === 'ACCEPTANCE' || notificationType === 'PUBLICATION' ? '#155724' : notificationType === 'REJECTION' ? '#721c24' : '#0c5460'};">
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
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/paper/${paperId}" 
                 style="background-color: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Paper Details
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your contribution to this research work.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message from JEDSD. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });

    return { success: true, message: "Contributor notification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending contributor notification email:", emailError);
    return { success: false, message: "Failed to send contributor notification email." };
  }
}
