import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";

export async function sendEditorStatusUpdateMail(
  paper: ResearchPaper, 
  editor: User, 
  editorStatus: string,
  editorNotes?: string
) {
  try {
    const statusMessages = {
      ACCEPTED_FOR_PUBLICATION: "has approved this paper for publication",
      REJECTED_FOR_PUBLICATION: "has rejected this paper for publication",
      ACCEPTED_FOR_EDIT: "has accepted to edit this paper",
      REJECTED_FOR_EDIT: "has declined to edit this paper",
      PENDING: "editing is still pending"
    };

    const statusMessage = statusMessages[editorStatus as keyof typeof statusMessages] || `status has been updated to ${editorStatus}`;

    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: editor.email,
      subject: `JEDSD - Editor Status Confirmation: ${paper.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Editor Status Confirmation</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Dear ${editor.name},
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is to confirm that your editor status has been updated in the JEDSD system.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Paper Details:</h3>
              <p style="margin: 8px 0;"><strong>Title:</strong> ${paper.title}</p>
              <p style="margin: 8px 0;"><strong>Editor Status:</strong> ${editorStatus}</p>
              <p style="margin: 8px 0;"><strong>Paper ID:</strong> ${paper.id}</p>
            </div>
            
            <div style="background-color: ${editorStatus.includes('ACCEPTED') ? '#d4edda' : editorStatus.includes('REJECTED') ? '#f8d7da' : '#d1ecf1'}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${editorStatus.includes('ACCEPTED') ? '#28a745' : editorStatus.includes('REJECTED') ? '#dc3545' : '#17a2b8'};">
              <p style="margin: 0; color: ${editorStatus.includes('ACCEPTED') ? '#155724' : editorStatus.includes('REJECTED') ? '#721c24' : '#0c5460'};">
                <strong>Status Update:</strong> You ${statusMessage}.
              </p>
            </div>
            
            ${editorNotes ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Your Editor Notes:</strong> ${editorNotes}
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Editor Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your contribution to the JEDSD editorial process.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message from JEDSD. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });

    return { success: true, message: "Editor status update email sent successfully." };
  } catch (emailError) {
    console.error("Error sending editor status update email:", emailError);
    return { success: false, message: "Failed to send editor status update email." };
  }
}
