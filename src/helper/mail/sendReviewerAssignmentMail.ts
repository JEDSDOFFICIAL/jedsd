import { sendEmail, generateReviewUrl, generateDashboardUrl } from './emailService';
import ReviewerAssignmentEmail from '../../../emails/ReviewerAssignmentMail';

interface ReviewerAssignmentData {
  reviewerName: string;
  reviewerEmail: string;
  paperTitle: string;
  paperAbstract: string;
  authorName: string;
  submissionDate: string;
  reviewDeadline: string;
  paperId: string;
}

export async function sendReviewerAssignmentEmail(data: ReviewerAssignmentData) {
  try {
    const reviewUrl = generateReviewUrl(data.paperId);
    const dashboardUrl = generateDashboardUrl();

    const result = await sendEmail({
      to: data.reviewerEmail,
      subject: `JEDSD - New Paper Assignment: ${data.paperTitle}`,
      react: ReviewerAssignmentEmail({
        reviewerName: data.reviewerName,
        paperTitle: data.paperTitle,
        paperAbstract: data.paperAbstract,
        authorName: data.authorName,
        submissionDate: data.submissionDate,
        reviewDeadline: data.reviewDeadline,
        reviewUrl,
        dashboardUrl,
      }),
    });

    if (result.success) {
      console.log('Reviewer assignment email sent successfully to:', data.reviewerEmail);
      return { success: true, message: 'Reviewer assignment email sent successfully.' };
    } else {
      console.error('Failed to send reviewer assignment email:', result.error);
      return { success: false, message: 'Failed to send reviewer assignment email.' };
    }
  } catch (error) {
    console.error('Error sending reviewer assignment email:', error);
    return { success: false, message: 'Failed to send reviewer assignment email.' };
  }
}
