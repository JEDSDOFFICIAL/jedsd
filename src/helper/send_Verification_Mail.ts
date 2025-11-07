import VerificationEmail from "../../emails/auth/VarificationMail";
import { resend } from "@/lib/mailer";
import { sendVerificationMailProps } from "./emailInterface";


export const sendVerificationMail = async ({otp,name,email}:sendVerificationMailProps) => {
try{
    const mailRes = await resend.emails.send({
        from: `JEDSD ADMIN <${process.env.NEXT_ENV_FROM_MAIL}>`,
        to: email,
        subject: "Verify your email",
        react: VerificationEmail({ otp, name: name })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending verification mail",err);
    throw err;
}
}