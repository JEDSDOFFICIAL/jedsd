import { ResearchPaper } from "@prisma/client";

import { resend } from "@/lib/mailer";
import specialMail from "../../emails/specialMail";


export const sendSpecialPaperUploadMailToEditor = async (paper: ResearchPaper) => {
try{
    const mailRes = await resend.emails.send({
        from: `JEDSD ADMIN <${process.env.NEXT_ENV_FROM_MAIL}>`,
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