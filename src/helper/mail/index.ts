// Authentication related emails
export { sendVerificationEmail } from "./sendVarificationMail";
export { sendPasswordResetEmail } from "./sendPasswordResetMail";
export { sendSuccessAuthMail } from "./sendSuccessAuthMail";

// Paper workflow emails
export { sendSuccessfulUploadPaperEmail } from "./sendSuccessfulUploadPaperMail";
export { sendReviewerPaperMail } from "./send-reviewer-new-paper-mail";
export { sendEditorPaperAllocationMail } from "./sendEditorPaperAllocationMail";

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
