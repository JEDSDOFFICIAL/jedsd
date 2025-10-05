import VerificationEmail from "../../emails/auth/VarificationMail";
import { resend } from "@/lib/mailer";
import { sendVerificationMailProps } from "./emailInterface";


export const sendVerificationMail = async ({otp,username,email}:sendVerificationMailProps) => {
try{
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: email,
        subject: "Verify your email",
        react: VerificationEmail({ otp, username })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending verification mail",err);
    throw err;
}
}