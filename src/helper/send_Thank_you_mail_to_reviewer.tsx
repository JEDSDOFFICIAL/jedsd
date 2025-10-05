import { resend } from "@/lib/mailer";

import { sendReviewedMailToEditorProps } from "./emailInterface";
import ReviewerThankYouEmail from "../../emails/reviewer/Thank_you_mail_to_reviewer_after_review";

export const sendThankYouEmail = async ({
    paperId, paperTitle, review, reviewerEmail, reviewerName
}:sendReviewedMailToEditorProps ) => {
  try {
    const mailRes = await resend.emails.send({
        from: process.env.NEXT_ENV_FROM_MAIL as string,
        to: reviewerEmail,
        subject: `Thank You for Reviewing: ${paperTitle}`,
        react: ReviewerThankYouEmail({ paperId, paperTitle, review, reviewerName, editorName: "Editor" })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending special mail",err);
    throw err;
}

}