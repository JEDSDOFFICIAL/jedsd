import { resend } from "@/utils/mailer";
import { ResearchPaper, User } from "@prisma/client";
import PaperUploadEmail from "../../../emails/PaperUploadMail";

interface Contributor {
  name: string;
  email: string;
  contribution: string;
}

interface PointOfContact {
  name: string;
  email: string;
  phone?: string;
}

export async function sendSuccessfulUploadPaperEmail(paper: ResearchPaper & { author: { email: string; name: string } | null }) {
  try {
    const emails = new Set<string>();

    // 1. Add main author email
    if (paper.author?.email) {
      emails.add(paper.author.email);
    }

    // 2. Parse contributors JSON and add emails
    const contributors: Contributor[] = Array.isArray(paper.contributors)
      ? paper.contributors
      : JSON.parse(paper.contributors as any);

    contributors.forEach((contributor) => {
      if (contributor.email) emails.add(contributor.email);
    });

    // 3. Parse pointOfContact JSON and add email
    const pointOfContact: PointOfContact =
      typeof paper.pointOfContact === "object"
        ? paper.pointOfContact
        : JSON.parse(paper.pointOfContact as any);

    if (pointOfContact?.email) emails.add(pointOfContact.email);

    Array.from(emails).push(process.env.NEXT_ENV_TO_ADMIN!); // Ensure the sender email is included
    // 4. Send email
    await resend.emails.send({
      from: process.env.NEXT_ENV_FROM_MAIL!,
      to: Array.from(emails),
      subject: "JEDSD successful new paper upload mail",
      react: PaperUploadEmail(paper),
    });

    return { success: true, message: "Upload success email sent to all contributors." };
  } catch (emailError) {
    console.error("Error sending upload email:", emailError);
    return { success: false, message: "Failed to send upload email." };
  }
}
