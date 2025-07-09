import { resend } from "@/utils/mailer";
import { render } from '@react-email/components';
import PasswordResetEmail from "../../../emails/PasswordResetMail";

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
) {
  try {
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const emailHtml = await render(PasswordResetEmail({
      username: username,
      resetUrl: resetLink
    }));
    
    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: email,
      subject: 'JEDSD Password Reset',
      html: emailHtml,
    });

    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
