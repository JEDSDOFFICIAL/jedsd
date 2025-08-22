// Authentication related emails
export { sendVerificationEmail } from "./sendVarificationMail";
export { sendPasswordResetEmail } from "./sendPasswordResetMail";
export { sendSuccessAuthMail } from "./sendSuccessAuthMail";

// Paper workflow emails
export { sendSuccessfulUploadPaperEmail } from "./sendSuccessfulUploadPaperMail";
export { sendReviewerPaperMail } from "./send-reviewer-new-paper-mail";
export { sendEditorPaperAllocationMail } from "./sendEditorPaperAllocationMail";

// New comprehensive email functions (using environment variables)
export { sendReviewerAssignmentEmail } from "./sendReviewerAssignmentMail";
export { sendReviewSubmissionEmail } from "./sendReviewSubmissionMail";
export { sendEditorDecisionEmail } from "./sendEditorDecisionMail";
export { sendPaperStatusNotificationEmail } from "./sendPaperStatusNotificationMail";
export { sendPaperPublicationEmail } from "./sendPaperPublicationMail";

// Status update emails
export { sendAuthorPaperStatusUpdateMail } from "./sendAuthorPaperStatusUpdateMail";
export { sendReviewerStatusUpdateMail } from "./sendReviewerStatusUpdateMail";
export { sendEditorStatusUpdateMail } from "./sendEditorStatusUpdateMail";

// Notification emails
export { sendAdminPaperNotificationMail } from "./sendAdminPaperNotificationMail";
export { sendPointOfContactNotificationMail } from "./sendPointOfContactNotificationMail";
export { sendContributorNotificationMail } from "./sendContributorNotificationMail";

// Comprehensive notification service
export { NotificationService } from "./NotificationService";

// Email service utilities
export {
  sendEmail,
  getBaseUrl,
  getFromEmail,
  getAdminEmail,
  generateResetPasswordUrl,
  generateVerificationUrl,
  generateDashboardUrl,
  generatePaperUrl,
  generateReviewUrl,
  generateEditorPaperUrl,
  generateAdminPaperUrl,
} from './emailService';

// Types for better TypeScript support
export interface Contributor {
  name: string;
  email: string;
  contribution: string;
}

export interface PointOfContact {
  name: string;
  email: string;
  phone?: string;
}

export type NotificationType = 'SUBMISSION' | 'STATUS_UPDATE' | 'REVIEW_COMPLETE' | 'PUBLICATION';
export type ContributorNotificationType = 'SUBMISSION' | 'ACCEPTANCE' | 'REJECTION' | 'PUBLICATION';
export type ReviewerStatus = 'ACCEPTED_FOR_PUBLICATION' | 'REJECTED_FOR_PUBLICATION' | 'ACCEPTED_FOR_REVIEW' | 'REJECTED_FOR_REVIEW' | 'PENDING';
export type EditorStatus = 'ACCEPTED_FOR_PUBLICATION' | 'REJECTED_FOR_PUBLICATION' | 'ACCEPTED_FOR_EDIT' | 'REJECTED_FOR_EDIT' | 'PENDING';

// Organized Email Services - All functions use environment variables for URLs

/**
 * Authentication & User Management Emails
 */
export const AuthEmails = {
  sendVerification: async (email: string, username: string, otp: string) => {
    const { sendVerificationEmail } = await import('./sendVarificationMail');
    return sendVerificationEmail(email, username, otp);
  },
  
  sendPasswordReset: async (email: string, username: string, resetToken: string) => {
    const { sendPasswordResetEmail } = await import('./sendPasswordResetMail');
    return sendPasswordResetEmail(email, username, resetToken);
  },
};

/**
 * Paper Submission Workflow Emails
 */
export const PaperSubmissionEmails = {
  sendUploadSuccess: async (paper: any) => {
    const { sendSuccessfulUploadPaperEmail } = await import('./sendSuccessfulUploadPaperMail');
    return sendSuccessfulUploadPaperEmail(paper);
  },
  
  sendStatusNotification: async (data: {
    authorName: string;
    authorEmail: string;
    paperTitle: string;
    status: 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUIRED';
    editorComments?: string;
    reviewerComments?: string;
    publicationDate?: string;
    revisionDeadline?: string;
    paperId: string;
    additionalEmails?: string[];
  }) => {
    const { sendPaperStatusNotificationEmail } = await import('./sendPaperStatusNotificationMail');
    return sendPaperStatusNotificationEmail(data);
  },
  
  sendPublicationNotification: async (data: {
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
    additionalEmails?: string[];
  }) => {
    const { sendPaperPublicationEmail } = await import('./sendPaperPublicationMail');
    return sendPaperPublicationEmail(data);
  },
};

/**
 * Review Process Emails
 */
export const ReviewProcessEmails = {
  assignReviewer: async (data: {
    reviewerName: string;
    reviewerEmail: string;
    paperTitle: string;
    paperAbstract: string;
    authorName: string;
    submissionDate: string;
    reviewDeadline: string;
    paperId: string;
  }) => {
    const { sendReviewerAssignmentEmail } = await import('./sendReviewerAssignmentMail');
    return sendReviewerAssignmentEmail(data);
  },
  
  notifyReviewSubmission: async (data: {
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
  }) => {
    const { sendReviewSubmissionEmail } = await import('./sendReviewSubmissionMail');
    return sendReviewSubmissionEmail(data);
  },
};

/**
 * Editorial Decision Emails
 */
export const EditorialEmails = {
  sendDecisionToPOC: async (data: {
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
  }) => {
    const { sendEditorDecisionEmail } = await import('./sendEditorDecisionMail');
    return sendEditorDecisionEmail(data);
  },
};

/**
 * Utility function to send emails to all paper contributors
 */
export const sendToAllContributors = async (
  paper: any,
  emailFunction: (email: string, ...args: any[]) => Promise<any>,
  ...args: any[]
) => {
  try {
    const emails = new Set<string>();

    // Add main author email
    if (paper.author?.email) {
      emails.add(paper.author.email);
    }

    // Parse and add contributor emails
    if (paper.contributors) {
      const contributors = Array.isArray(paper.contributors)
        ? paper.contributors
        : JSON.parse(paper.contributors);
      
      contributors.forEach((contributor: any) => {
        if (contributor.email) emails.add(contributor.email);
      });
    }

    // Parse and add point of contact email
    if (paper.pointOfContact) {
      const pointOfContact = typeof paper.pointOfContact === "object"
        ? paper.pointOfContact
        : JSON.parse(paper.pointOfContact);
      
      if (pointOfContact?.email) emails.add(pointOfContact.email);
    }

    // Send emails to all recipients
    const results = await Promise.all(
      Array.from(emails).map(email => emailFunction(email, ...args))
    );

    const allSuccessful = results.every(result => result.success);
    return {
      success: allSuccessful,
      message: allSuccessful 
        ? 'Emails sent to all contributors successfully'
        : 'Some emails failed to send',
      recipients: Array.from(emails),
      results
    };
  } catch (error) {
    console.error('Error sending emails to contributors:', error);
    return {
      success: false,
      message: 'Failed to send emails to contributors',
      error
    };
  }
};
