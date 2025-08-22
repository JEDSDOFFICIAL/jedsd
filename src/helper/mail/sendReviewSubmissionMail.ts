import { sendEmail, generateEditorPaperUrl, generateDashboardUrl } from './emailService';
import ReviewSubmissionEmail from '../../../emails/ReviewSubmissionMail';

interface ReviewSubmissionData {
  editorName: string;
  editorEmail: string;
  reviewerName: string;
  paperTitle: string;
  authorName: string;
  reviewScore: number;
  recommendation: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  reviewComments: string;
  submissionDate: string;
  paperId: string;
}

export async function sendReviewSubmissionEmail(data: ReviewSubmissionData) {
  try {
    const paperUrl = generateEditorPaperUrl(data.paperId);
    const dashboardUrl = generateDashboardUrl();

    const result = await sendEmail({
      to: data.editorEmail,
      subject: `JEDSD - Review Submitted: ${data.paperTitle}`,
      react: ReviewSubmissionEmail({
        editorName: data.editorName,
        reviewerName: data.reviewerName,
        paperTitle: data.paperTitle,
        authorName: data.authorName,
        reviewScore: data.reviewScore,
        recommendation: data.recommendation,
        reviewComments: data.reviewComments,
        submissionDate: data.submissionDate,
        paperUrl,
        dashboardUrl,
      }),
    });

    if (result.success) {
      console.log('Review submission email sent successfully to:', data.editorEmail);
      return { success: true, message: 'Review submission email sent successfully.' };
    } else {
      console.error('Failed to send review submission email:', result.error);
      return { success: false, message: 'Failed to send review submission email.' };
    }
  } catch (error) {
    console.error('Error sending review submission email:', error);
    return { success: false, message: 'Failed to send review submission email.' };
  }
}
