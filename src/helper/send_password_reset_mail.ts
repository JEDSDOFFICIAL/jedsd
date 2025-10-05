
import { resend } from "@/lib/mailer";
import { sendVerificationMailProps } from "./emailInterface";
import PasswordResetEmail from "../../emails/auth/PasswordResetMail";



export const sendPasswordResetEmail = async ({otp,username,email}:sendVerificationMailProps) => {
try{
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: email,
        subject: "Reset your password",
        react: PasswordResetEmail({ resetUrl:`${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?otp=${otp}`, username })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending verification mail",err);
    throw err;
}
}