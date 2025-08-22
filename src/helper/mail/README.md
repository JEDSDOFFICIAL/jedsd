# JEDSD Email Service Documentation

This directory contains all email functionality for the Journal of Engineering Design and Sustainable Development (JEDSD) website. All email templates and sending functions use environment variables for URLs and configuration.

## Environment Variables Required

The following environment variables must be set in your `.env` file:

```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key
NEXT_ENV_FROM_MAIL=noreply@jedsd.com
NEXT_ENV_TO_ADMIN=admin@jedsd.com

# Base URL for links in emails
NEXTAUTH_URL=https://your-domain.com
# For development: NEXTAUTH_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
```

## Email Templates

All email templates are located in the `/emails` directory and use React Email components:

### Authentication Emails
- `VarificationMail.tsx` - Email verification with OTP
- `PasswordResetMail.tsx` - Password reset with secure link

### Paper Workflow Emails
- `SuccessfulPaperUploadMail.tsx` - Confirmation of paper submission
- `ReviewerAssignmentMail.tsx` - Notifies reviewer of new paper assignment
- `ReviewSubmissionMail.tsx` - Notifies editor when review is submitted
- `EditorDecisionMail.tsx` - Sends editorial decision to Point of Contact
- `PaperStatusNotificationMail.tsx` - General paper status updates
- `PaperPublicationMail.tsx` - Publication celebration email

### Existing Templates
- `AuthorPaperStatusUpdateMail.tsx` - Author-specific status updates
- `EditorPaperAllocationMail.tsx` - Editor paper assignment
- `ReviewerAcceptanceMail.tsx` - Reviewer acceptance confirmation
- `AdminPaperNotificationMail.tsx` - Admin notifications
- `PaperUploadMail.tsx` - Upload notifications

## Email Sending Functions

All email sending functions automatically use environment variables for URLs and configuration.

### Usage Examples

#### 1. Authentication Emails

```typescript
import { AuthEmails } from '@/helper/mail';

// Send verification email
await AuthEmails.sendVerification(
  'user@example.com',
  'John Doe',
  '123456'
);

// Send password reset email
await AuthEmails.sendPasswordReset(
  'user@example.com',
  'John Doe',
  'reset-token-123'
);
```

#### 2. Paper Submission Workflow

```typescript
import { PaperSubmissionEmails } from '@/helper/mail';

// Send upload success email
await PaperSubmissionEmails.sendUploadSuccess(paperData);

// Send status notification
await PaperSubmissionEmails.sendStatusNotification({
  authorName: 'Dr. Jane Smith',
  authorEmail: 'jane@university.edu',
  paperTitle: 'Sustainable Design Principles',
  status: 'ACCEPTED',
  editorComments: 'Excellent work!',
  paperId: 'paper-123',
  additionalEmails: ['poc@university.edu']
});

// Send publication notification
await PaperSubmissionEmails.sendPublicationNotification({
  authorName: 'Dr. Jane Smith',
  authorEmail: 'jane@university.edu',
  paperTitle: 'Sustainable Design Principles',
  publicationDate: '2024-12-01',
  volume: '15',
  issue: '2',
  doi: '10.1234/jedsd.2024.001',
  citationFormat: 'Smith, J. (2024). Sustainable Design Principles...',
  paperId: 'paper-123'
});
```

#### 3. Review Process

```typescript
import { ReviewProcessEmails } from '@/helper/mail';

// Assign reviewer
await ReviewProcessEmails.assignReviewer({
  reviewerName: 'Dr. Bob Wilson',
  reviewerEmail: 'bob@reviewer.com',
  paperTitle: 'Advanced Engineering Methods',
  paperAbstract: 'This paper presents...',
  authorName: 'Dr. Alice Brown',
  submissionDate: '2024-11-01',
  reviewDeadline: '2024-12-01',
  paperId: 'paper-123'
});

// Notify editor of review submission
await ReviewProcessEmails.notifyReviewSubmission({
  editorName: 'Dr. Carol Green',
  editorEmail: 'carol@editor.com',
  reviewerName: 'Dr. Bob Wilson',
  paperTitle: 'Advanced Engineering Methods',
  authorName: 'Dr. Alice Brown',
  reviewScore: 8,
  recommendation: 'MINOR_REVISION',
  reviewComments: 'Good work, minor issues to address...',
  submissionDate: '2024-11-01',
  paperId: 'paper-123'
});
```

#### 4. Editorial Decisions

```typescript
import { EditorialEmails } from '@/helper/mail';

// Send editorial decision to Point of Contact
await EditorialEmails.sendDecisionToPOC({
  pocName: 'Dr. David Lee',
  pocEmail: 'david@poc.com',
  editorName: 'Dr. Carol Green',
  paperTitle: 'Advanced Engineering Methods',
  authorName: 'Dr. Alice Brown',
  decision: 'MINOR_REVISION',
  editorComments: 'Please address the reviewer comments...',
  reviewerComments: 'Minor issues with methodology...',
  revisionDeadline: '2024-12-15',
  paperId: 'paper-123'
});
```

## Direct Function Imports

You can also import individual functions directly:

```typescript
import { 
  sendReviewerAssignmentEmail,
  sendPaperStatusNotificationEmail,
  sendPaperPublicationEmail,
  generateDashboardUrl,
  generatePaperUrl
} from '@/helper/mail';

// Use individual functions
await sendReviewerAssignmentEmail(reviewerData);

// Generate URLs for use in your own emails
const dashboardUrl = generateDashboardUrl(); // Uses NEXTAUTH_URL from env
const paperUrl = generatePaperUrl('paper-123');
```

## URL Generation

All URLs are automatically generated from environment variables:

- `generateDashboardUrl()` → `{NEXTAUTH_URL}/dashboard`
- `generatePaperUrl(id)` → `{NEXTAUTH_URL}/paper/{id}`
- `generateReviewUrl(id)` → `{NEXTAUTH_URL}/review/{id}`
- `generateEditorPaperUrl(id)` → `{NEXTAUTH_URL}/dashboard/editor/papers/{id}`
- `generateAdminPaperUrl(id)` → `{NEXTAUTH_URL}/dashboard/admin/papers/{id}`

## Email Service Utilities

The `emailService.ts` file provides core utilities:

```typescript
import { 
  sendEmail, 
  getBaseUrl, 
  getFromEmail, 
  getAdminEmail 
} from '@/helper/mail';

// Send custom email
await sendEmail({
  to: 'recipient@example.com',
  subject: 'Custom Subject',
  react: CustomEmailComponent({ data })
});

// Get configuration values
const baseUrl = getBaseUrl(); // From NEXTAUTH_URL
const fromEmail = getFromEmail(); // From NEXT_ENV_FROM_MAIL
const adminEmail = getAdminEmail(); // From NEXT_ENV_TO_ADMIN
```

## Error Handling

All email functions return a consistent response format:

```typescript
{
  success: boolean;
  message: string;
  error?: any; // Only present if success is false
}
```

Example usage with error handling:

```typescript
const result = await AuthEmails.sendVerification(email, username, otp);

if (result.success) {
  console.log('Email sent successfully');
} else {
  console.error('Failed to send email:', result.message);
}
```

## Testing

For development, you can test emails using:

1. **Local development**: Set `NEXTAUTH_URL=http://localhost:3000`
2. **Email testing services**: Use services like Mailtrap or Resend's test mode
3. **Environment-specific configs**: Different `.env` files for dev/staging/production

## Contributing

When adding new email templates:

1. Create the template in `/emails` directory using React Email components
2. Create a corresponding sender function in `/src/helper/mail`
3. Use environment variables for all URLs via `emailService.ts` utilities
4. Export the function in `/src/helper/mail/index.ts`
5. Add appropriate TypeScript types
6. Update this documentation

## Best Practices

1. **Always use environment variables** for URLs and configuration
2. **Include fallbacks** for development (e.g., `process.env.NEXTAUTH_URL || 'http://localhost:3000'`)
3. **Use the provided utility functions** for URL generation
4. **Handle errors gracefully** and provide meaningful messages
5. **Test emails** in development before deploying
6. **Keep templates responsive** and accessible
7. **Include unsubscribe information** where appropriate
