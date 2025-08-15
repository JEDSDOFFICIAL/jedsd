import { resend } from "@/lib/mailer";
import SuccessAuthentication from "../../../emails/successAuthenticate";



export async function sendSuccessAuthMail(
  email: string,
  name: string = "User",
  username: string = "user"
) {
  try {
    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: email,
      subject: 'JEDSD Successful Authentication',
      react: SuccessAuthentication({name, username}),
    });
    //console.log('Verification email sent successfully.');

    
    
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}