import { resend } from "@/utils/mailer";
import SuccessAuthentication from "../../../emails/successAuthenticate";



export async function sendSuccessAuthMail(
  email: string,
  username: string,
) {
  try {
    console.log('Sending verification email...');
    console.log('Email:', email);
    console.log('Username:', username);

    console.log('From:', process.env.NEXT_ENV_FROM_MAIL);
    
    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: email,
      subject: 'JEDSD Successful Authentication',
      react: SuccessAuthentication({username}),
    });
    console.log('Verification email sent successfully.');

    
    
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}