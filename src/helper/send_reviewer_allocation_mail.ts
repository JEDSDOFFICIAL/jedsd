

import { resend } from "@/lib/mailer";
import ReviewerAllocationEmail from "../../emails/reviewer/reviewerAllocationMail";
import { sendReviewerAllocationMailProps } from "./emailInterface";

export const sendReviewerAllocationMail = async ({
  paper,
  reviewerName,
  revieweremail 
}: sendReviewerAllocationMailProps) => {
  try {
    const mailRes = await resend.emails.send({
        from: `JEDSD ADMIN <${process.env.NEXT_ENV_FROM_MAIL}>`,
        to: revieweremail as string,
        subject: "New Manuscript Submission",
        react: ReviewerAllocationEmail({ paper, reviewerName, revieweremail })
    })
    return mailRes;
}
catch(err){
    console.log("Error sending special mail",err);
    throw err;
}

}