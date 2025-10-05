import { ResearchPaper } from "@prisma/client";

import { resend } from "@/lib/mailer";
import specialMail from "../../emails/specialMail";


export const sendPaperUploadMail = async (paper: ResearchPaper) => {
try{
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: ['jedsdofficial@gmail.com','editorial@jedsd.com'],
        subject: "New Manuscript Submission",
        react: specialMail(paper)
    })
    return mailRes;
}
catch(err){
    console.log("Error sending special mail",err);
    throw err;
}

}