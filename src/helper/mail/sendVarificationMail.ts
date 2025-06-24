import { resend } from "@/utils/mailer";
import VerificationEmail from "../../../emails/VarificationMail";


export async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string
) {
  try {
    console.log('Sending verification email...');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Verification code:', otp);
    console.log('From:', process.env.NEXT_ENV_FROM_MAIL);
    
    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: email,
      subject: 'JEDSD Varification Code',
      react: VerificationEmail({ username, otp }),
    });
    console.log('Verification email sent successfully.');
    console.log('otp', otp);
    
    
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}