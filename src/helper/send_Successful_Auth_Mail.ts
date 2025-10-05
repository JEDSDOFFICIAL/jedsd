import SuccessAuthentication from "../../emails/auth/successAuthenticate";
import { resend } from "@/lib/mailer";



export const sendSuccessAuthenticationMail = async (name:string,email:string) => {
try{
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