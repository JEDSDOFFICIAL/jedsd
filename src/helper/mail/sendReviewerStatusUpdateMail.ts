import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";

export async function sendReviewerStatusUpdateMail(
  paper: ResearchPaper, 
  reviewer: User, 
  reviewerStatus: string,
  reviewText?: string,
  rating?: number
) {
  try {
    const statusMessages = {
      ACCEPTED_FOR_PUBLICATION: "has recommended this paper for publication",
      REJECTED_FOR_PUBLICATION: "has recommended against publication of this paper",
      ACCEPTED_FOR_REVIEW: "has accepted to review this paper",
      REJECTED_FOR_REVIEW: "has declined to review this paper",
      PENDING: "review is still pending"
    };

    const statusMessage = statusMessages[reviewerStatus as keyof typeof statusMessages] || `status has been updated to ${reviewerStatus}`;

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: reviewer.email,
      subject: `JEDSD - Review Status Confirmation: ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Review Status Confirmation</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Dear ${reviewer.name},
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is to confirm that your review status has been updated in the JEDSD system.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Paper Details:</h3>
              <p style="margin: 8px 0;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 8px 0;"><strong>Review Status:</strong> ${reviewerStatus}</p>
              <p style="margin: 8px 0;"><strong>Paper ID:</strong> ${paper.id}</p>
              ${rating ? `<p style="margin: 8px 0;"><strong>Rating:</strong> ${rating}/10</p>` : ''}
            </div>
            
            <div style="background-color: ${reviewerStatus.includes('ACCEPTED') ? '#d4edda' : reviewerStatus.includes('REJECTED') ? '#f8d7da' : '#d1ecf1'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${reviewerStatus.includes('ACCEPTED') ? '#28a745' : reviewerStatus.includes('REJECTED') ? '#dc3545' : '#17a2b8'};">
              <p style="margin: 0; color: ${reviewerStatus.includes('ACCEPTED') ? '#155724' : reviewerStatus.includes('REJECTED') ? '#721c24' : '#0c5460'};">
                <strong>Status Update:</strong> You ${statusMessage}.
              </p>
            </div>
            
            ${reviewText ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Your Review:</strong> ${reviewText}
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                 style="background-color: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Reviewer Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your contribution to the JEDSD review process.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message from JEDSD. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });

    return { success: true, message: "Reviewer status update email sent successfully." };
  } catch (emailError) {
    console.error("Error sending reviewer status update email:", emailError);
    return { success: false, message: "Failed to send reviewer status update email." };
  }
}
