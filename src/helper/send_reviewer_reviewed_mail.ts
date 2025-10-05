import { resend } from "@/lib/mailer";
import ReviewSubmissionEmail from "../../emails/reviewer/ReviewSubmissionMail";
import { sendReviewedMailToEditorProps } from "./emailInterface";

export const sendReviewedMail = async ({
    paperId, paperTitle, review, reviewerEmail, reviewerName
}:sendReviewedMailToEditorProps ) => {
  try {
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: ['jedsdofficial@gmail.com','editorial@jedsd.com'],
        subject: "New Review Submission",
        react: ReviewSubmissionEmail({ paperId, paperTitle, review, reviewerEmail, reviewerName })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending special mail",err);
    throw err;
}

}