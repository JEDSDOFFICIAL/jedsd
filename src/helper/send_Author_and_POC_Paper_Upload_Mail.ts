import PaperUploadEmail from "../../emails/author/PaperUploadMail";
import { resend } from "@/lib/mailer";
import { sendPaperUploadMailProps } from "./emailInterface";



export const sendPaperUploadMail = async ({ paper, emails }: sendPaperUploadMailProps) => {
try{
    const mailRes = await resend.emails.send({
        from: `JEDSD ADMIN <${process.env.NEXT_ENV_FROM_MAIL}>`,
        to: emails,
        subject: "Successful Manuscript Submission",
        react: PaperUploadEmail( paper)
    })
    return mailRes;
}
catch(err){
    console.log("Error sending paper upload mail",err);
    throw err;
}

}