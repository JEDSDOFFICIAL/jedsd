import { sendEmail, generatePaperUrl, generateDashboardUrl } from './emailService';
import EditorDecisionEmail from '../../../emails/EditorDecisionMail';

interface EditorDecisionData {
  pocName: string;
  pocEmail: string;
  editorName: string;
  paperTitle: string;
  authorName: string;
  decision: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  editorComments: string;
  reviewerComments?: string;
  revisionDeadline?: string;
  paperId: string;
}

export async function sendEditorDecisionEmail(data: EditorDecisionData) {
  try {
    const paperUrl = generatePaperUrl(data.paperId);
    const dashboardUrl = generateDashboardUrl();

    const getSubjectByDecision = () => {
      switch (data.decision) {
        case 'ACCEPT':
          return `JEDSD - Paper Accepted: ${data.paperTitle}`;
        case 'MINOR_REVISION':
          return `JEDSD - Minor Revision Required: ${data.paperTitle}`;
        case 'MAJOR_REVISION':
          return `JEDSD - Major Revision Required: ${data.paperTitle}`;
        case 'REJECT':
          return `JEDSD - Submission Decision: ${data.paperTitle}`;
        default:
          return `JEDSD - Editorial Decision: ${data.paperTitle}`;
      }
    };

    const result = await sendEmail({
      to: data.pocEmail,
      subject: getSubjectByDecision(),
      react: EditorDecisionEmail({
        pocName: data.pocName,
        editorName: data.editorName,
        paperTitle: data.paperTitle,
        authorName: data.authorName,
        decision: data.decision,
        editorComments: data.editorComments,
        reviewerComments: data.reviewerComments,
        revisionDeadline: data.revisionDeadline,
        paperUrl,
        dashboardUrl,
      }),
    });

    if (result.success) {
      console.log('Editor decision email sent successfully to:', data.pocEmail);
      return { success: true, message: 'Editor decision email sent successfully.' };
    } else {
      console.error('Failed to send editor decision email:', result.error);
      return { success: false, message: 'Failed to send editor decision email.' };
    }
  } catch (error) {
    console.error('Error sending editor decision email:', error);
    return { success: false, message: 'Failed to send editor decision email.' };
  }
}
