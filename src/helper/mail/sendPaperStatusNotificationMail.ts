import { sendEmail, generatePaperUrl, generateDashboardUrl } from './emailService';
import PaperStatusNotificationEmail from '../../../emails/PaperStatusNotificationMail';

interface PaperStatusNotificationData {
  authorName: string;
  authorEmail: string;
  paperTitle: string;
  status: 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUIRED';
  editorComments?: string;
  reviewerComments?: string;
  publicationDate?: string;
  revisionDeadline?: string;
  paperId: string;
  // Additional recipients (POC, contributors)
  additionalEmails?: string[];
}

export async function sendPaperStatusNotificationEmail(data: PaperStatusNotificationData) {
  try {
    const paperUrl = generatePaperUrl(data.paperId);
    const dashboardUrl = generateDashboardUrl();

    const getSubjectByStatus = () => {
      switch (data.status) {
        case 'ACCEPTED':
          return `🎉 JEDSD - Paper Accepted: ${data.paperTitle}`;
        case 'REJECTED':
          return `JEDSD - Submission Decision: ${data.paperTitle}`;
        case 'REVISION_REQUIRED':
          return `JEDSD - Revision Required: ${data.paperTitle}`;
        default:
          return `JEDSD - Paper Status Update: ${data.paperTitle}`;
      }
    };

    // Collect all email recipients
    const allEmails = new Set<string>();
    allEmails.add(data.authorEmail);
    
    if (data.additionalEmails) {
      data.additionalEmails.forEach(email => allEmails.add(email));
    }

    const emailPromises = Array.from(allEmails).map(async (email) => {
      return await sendEmail({
        to: email,
        subject: getSubjectByStatus(),
        react: PaperStatusNotificationEmail({
          authorName: data.authorName,
          paperTitle: data.paperTitle,
          status: data.status,
          editorComments: data.editorComments,
          reviewerComments: data.reviewerComments,
          publicationDate: data.publicationDate,
          revisionDeadline: data.revisionDeadline,
          paperUrl,
          dashboardUrl,
        }),
      });
    });

    const results = await Promise.all(emailPromises);
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      console.log('Paper status notification emails sent successfully to all recipients');
      return { success: true, message: 'Paper status notification emails sent successfully.' };
    } else {
      console.error('Some paper status notification emails failed to send');
      return { success: false, message: 'Some paper status notification emails failed to send.' };
    }
  } catch (error) {
    console.error('Error sending paper status notification emails:', error);
    return { success: false, message: 'Failed to send paper status notification emails.' };
  }
}
