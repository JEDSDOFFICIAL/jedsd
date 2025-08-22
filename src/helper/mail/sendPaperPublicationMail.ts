import { sendEmail, generatePaperUrl, generateDashboardUrl, getBaseUrl } from './emailService';
import PaperPublicationEmail from '../../../emails/PaperPublicationMail';

interface PaperPublicationData {
  authorName: string;
  authorEmail: string;
  paperTitle: string;
  publicationDate: string;
  volume?: string;
  issue?: string;
  pageNumbers?: string;
  doi?: string;
  citationFormat: string;
  paperId: string;
  // Additional recipients (POC, contributors)
  additionalEmails?: string[];
}

export async function sendPaperPublicationEmail(data: PaperPublicationData) {
  try {
    const paperUrl = generatePaperUrl(data.paperId);
    const journalUrl = getBaseUrl();
    const dashboardUrl = generateDashboardUrl();

    // Collect all email recipients
    const allEmails = new Set<string>();
    allEmails.add(data.authorEmail);
    
    if (data.additionalEmails) {
      data.additionalEmails.forEach(email => allEmails.add(email));
    }

    const emailPromises = Array.from(allEmails).map(async (email) => {
      return await sendEmail({
        to: email,
        subject: `🎉 JEDSD - Your Paper is Published: ${data.paperTitle}`,
        react: PaperPublicationEmail({
          authorName: data.authorName,
          paperTitle: data.paperTitle,
          publicationDate: data.publicationDate,
          volume: data.volume,
          issue: data.issue,
          pageNumbers: data.pageNumbers,
          doi: data.doi,
          citationFormat: data.citationFormat,
          paperUrl,
          journalUrl,
          dashboardUrl,
        }),
      });
    });

    const results = await Promise.all(emailPromises);
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      console.log('Paper publication emails sent successfully to all recipients');
      return { success: true, message: 'Paper publication emails sent successfully.' };
    } else {
      console.error('Some paper publication emails failed to send');
      return { success: false, message: 'Some paper publication emails failed to send.' };
    }
  } catch (error) {
    console.error('Error sending paper publication emails:', error);
    return { success: false, message: 'Failed to send paper publication emails.' };
  }
}
