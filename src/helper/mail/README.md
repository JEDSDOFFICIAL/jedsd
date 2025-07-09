# JEDSD Mail Notification System

This directory contains all the email notification functions for the JEDSD (Journal of Engineering and Data Science Development) system.

## Available Mail Functions

### Authentication Emails
- `sendVerificationEmail` - Send OTP verification email to new users
- `sendPasswordResetEmail` - Send password reset link to users
- `sendSuccessAuthMail` - Send welcome email after successful authentication

### Paper Workflow Emails
- `sendSuccessfulUploadPaperEmail` - Notify author and contributors about successful paper upload
- `sendReviewerPaperMail` - Notify reviewer about new paper assignment
- `sendEditorPaperAllocationMail` - Notify editor about new paper assignment

### Status Update Emails
- `sendAuthorPaperStatusUpdateMail` - Notify author about paper status changes
- `sendReviewerStatusUpdateMail` - Confirm reviewer status updates
- `sendEditorStatusUpdateMail` - Confirm editor status updates

### Notification Emails
- `sendAdminPaperNotificationMail` - Notify admins about paper activities
- `sendPointOfContactNotificationMail` - Notify point of contact about paper updates
- `sendContributorNotificationMail` - Notify contributors about paper status

## NotificationService

The `NotificationService` class provides comprehensive notification methods that automatically send emails to all relevant parties:

### Usage Examples

```typescript
import { NotificationService } from "@/helper/mail";

// When paper status changes
await NotificationService.sendPaperStatusUpdateNotifications(
  paper, // ResearchPaper with author
  'ACCEPTED',
  'Your paper has been accepted after review'
);

// When reviewer is assigned
await NotificationService.sendReviewerAssignmentNotifications(
  paper, // ResearchPaper with author
  reviewer // User object
);

// When editor is assigned
await NotificationService.sendEditorAssignmentNotifications(
  paper, // ResearchPaper with author
  editor // User object
);

// When paper is published
await NotificationService.sendPublicationNotifications(
  paper // ResearchPaper with author
);

// When reviewer updates status
await NotificationService.sendReviewerStatusNotifications(
  paper,
  reviewer,
  'ACCEPTED_FOR_PUBLICATION',
  'This paper meets publication standards',
  8 // rating out of 10
);

// When editor updates status
await NotificationService.sendEditorStatusNotifications(
  paper,
  editor,
  'ACCEPTED_FOR_PUBLICATION',
  'Editorial review completed successfully'
);
```

## Email Templates

All emails use consistent HTML templates with:
- Responsive design
- JEDSD branding
- Clear call-to-action buttons
- Professional styling
- Conditional content based on status

## Environment Variables Required

- `NEXT_ENV_FROM_MAIL` - Sender email address
- `NEXTAUTH_URL` - Base URL for links in emails
- `RESEND_API_KEY` - API key for email service (configured in mailer)

## Error Handling

All functions return a result object with:
```typescript
{
  success: boolean;
  message: string;
}
```

Functions handle errors gracefully and log them for debugging while still allowing the main application flow to continue.

## Integration Points

These mail functions are typically called from:
- Paper upload APIs
- Status update APIs
- Assignment workflows
- Authentication flows
- Admin actions

The NotificationService should be the preferred method for sending notifications as it ensures all relevant parties are notified automatically.
