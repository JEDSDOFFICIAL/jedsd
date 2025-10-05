
import { resend } from "@/lib/mailer";
import { sendReviewerAcceptanceMailProps } from "./emailInterface";
import ReviewerAcceptanceEmail from "../../emails/reviewer/ReviewerAcceptanceMail";



export const sendReviewerAcceptanceMail = async ({ paperTitle, reviewerName, acceptanceStatus }: sendReviewerAcceptanceMailProps) => {
try{
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: ['jedsdofficial@gmail.com','editorial@jedsd.com'], // Send to editorial team
        subject: "Reviewer Assignment Update",
        react: ReviewerAcceptanceEmail({ paperTitle, reviewerName, acceptanceStatus })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending reviewer acceptance mail",err);
    throw err;
}

}