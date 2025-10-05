import SuccessAuthentication from "../../emails/auth/successAuthenticate";
import { resend } from "@/lib/mailer";



export const sendSuccessAuthenticationMail = async ({name, email}: {name: string, email: string}) => {
try{
    console.log("Sending successful authentication mail to:", email);
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: email,
        subject: "Successful Authentication",
        react: SuccessAuthentication(name)
    })
    return mailRes;
}
catch(err){
    console.log("Error sending successful authentication mail",err);
    throw err;
}

}