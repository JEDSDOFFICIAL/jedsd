import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Section,
  Text,
  Button,
  Container,
  Hr,
  Img,
} from '@react-email/components';

interface PaperStatusNotificationEmailProps {
  authorName: string;
  paperTitle: string;
  status: 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUIRED';
  editorComments?: string;
  reviewerComments?: string;
  publicationDate?: string;
  revisionDeadline?: string;
  paperUrl: string;
  dashboardUrl: string;
}

export default function PaperStatusNotificationEmail({
  authorName,
  paperTitle,
  status,
  editorComments,
  reviewerComments,
  publicationDate,
  revisionDeadline,
  paperUrl,
  dashboardUrl,
}: PaperStatusNotificationEmailProps) {
  const getStatusEmoji = () => {
    switch (status) {
      case 'ACCEPTED': return '🎉';
      case 'REJECTED': return '😔';
      case 'REVISION_REQUIRED': return '📝';
      default: return '📄';
    }
  };

  const getStatusGradient = () => {
    switch (status) {
      case 'ACCEPTED': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'REJECTED': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'REVISION_REQUIRED': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default: return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ACCEPTED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'REVISION_REQUIRED': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ACCEPTED': return 'Accepted for Publication';
      case 'REJECTED': return 'Not Accepted for Publication';
      case 'REVISION_REQUIRED': return 'Revision Required';
      default: return 'Status Updated';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'ACCEPTED':
        return 'Congratulations! We are pleased to inform you that your manuscript has been accepted for publication in JEDSD.';
      case 'REJECTED':
        return 'We regret to inform you that your manuscript has not been accepted for publication at this time.';
      case 'REVISION_REQUIRED':
        return 'Your manuscript requires revisions before it can be considered for publication. Please review the feedback and submit your revised manuscript.';
      default:
        return 'Your manuscript status has been updated.';
    }
  };

  const getPreviewText = () => {
    switch (status) {
      case 'ACCEPTED': return `Congratulations! Your paper "${paperTitle}" has been accepted`;
      case 'REJECTED': return `Update on your paper submission: "${paperTitle}"`;
      case 'REVISION_REQUIRED': return `Revision required for: "${paperTitle}"`;
      default: return `Status update for: "${paperTitle}"`;
    }
  };

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Paper Status Update</title>
        <Font
          fontFamily="Arial"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{getPreviewText()}</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Paper Status Update
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {authorName},
          </Text>
          
          <Text style={textStyle}>
            We are writing to update you on the status of your manuscript submission to the Journal of Engineering Design and Sustainable Development (JEDSD).
          </Text>
          
          <Section style={paperDetailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Manuscript Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Title:</strong> {paperTitle}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Author:</strong> {authorName}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Status Date:</strong> {new Date().toLocaleDateString()}
            </Text>
          </Section>
          
          <Section style={{
            ...statusBoxStyle,
            borderLeftColor: getStatusColor(),
          }}>
            <Section style={{
              ...statusBadgeStyle,
              backgroundColor: getStatusColor(),
            }}>
              <Text style={statusTextStyle}>
                <strong>Status:</strong> {getStatusText()}
              </Text>
            </Section>
            <Text style={statusMessageStyle}>
              {getStatusMessage()}
            </Text>
          </Section>

          {status === 'ACCEPTED' && publicationDate && (
            <Section style={publicationBoxStyle}>
              <Text style={publicationTextStyle}>
                <strong>📅 Expected Publication Date:</strong> {publicationDate}
              </Text>
            </Section>
          )}

          {status === 'REVISION_REQUIRED' && revisionDeadline && (
            <Section style={deadlineBoxStyle}>
              <Text style={deadlineTextStyle}>
                <strong>⏰ Revision Deadline:</strong> {revisionDeadline}
              </Text>
            </Section>
          )}
          
          {editorComments && (
            <Section style={commentsBoxStyle}>
              <Heading as="h4" style={commentsHeadingStyle}>
                Editor Comments:
              </Heading>
              <Text style={commentsTextStyle}>
                {editorComments}
              </Text>
            </Section>
          )}
          
          {reviewerComments && (
            <Section style={reviewerCommentsBoxStyle}>
              <Heading as="h4" style={commentsHeadingStyle}>
                Reviewer Comments:
              </Heading>
              <Text style={commentsTextStyle}>
                {reviewerComments}
              </Text>
            </Section>
          )}
          
          {status === 'ACCEPTED' && (
            <Section style={nextStepsBoxStyle}>
              <Text style={nextStepsTextStyle}>
                <strong>What Happens Next:</strong><br />
                • Your manuscript will enter the production process<br />
                • You will receive proofs for final review<br />
                • Copyright agreement will be sent for your signature<br />
                • Final publication will be completed within 2-4 weeks<br />
                • You will be notified once your paper is live
              </Text>
            </Section>
          )}

          {status === 'REVISION_REQUIRED' && (
            <Section style={revisionStepsBoxStyle}>
              <Text style={revisionStepsTextStyle}>
                <strong>Revision Guidelines:</strong><br />
                • Carefully address all reviewer and editor feedback<br />
                • Provide a detailed response letter<br />
                • Highlight changes in your revised manuscript<br />
                • Submit within the deadline specified above<br />
                • Contact us at editorial@jedsd.com if you need an extension
              </Text>
            </Section>
          )}

          {status === 'REJECTED' && (
            <Section style={rejectionStepsBoxStyle}>
              <Text style={rejectionStepsTextStyle}>
                <strong>We encourage you to:</strong><br />
                • Consider the reviewers' feedback for future submissions<br />
                • Explore other suitable journals for your work<br />
                • Continue your valuable research contributions<br />
                • Feel free to submit future work to JEDSD
              </Text>
            </Section>
          )}
          
          <Section style={buttonSectionStyle}>
            <Button style={primaryButtonStyle} href={paperUrl}>
              View Paper Details
            </Button>
            <Button style={secondaryButtonStyle} href={dashboardUrl}>
              Go to Dashboard
            </Button>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            Thank you for choosing JEDSD for your research publication.<br />
            If you have any questions, please contact us at editorial@jedsd.com.<br />
            This is an automated message - please do not reply to this email.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

const containerStyle = {
  fontFamily: 'Arial, sans-serif',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#f8f9fa',
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const headingStyle = {
  color: '#2c3e50',
  marginBottom: '20px',
  fontSize: '26px',
  fontWeight: '600',
  textAlign: 'center' as const,
};

const greetingStyle = {
  color: '#34495e',
  lineHeight: '1.6',
  marginBottom: '20px',
  fontSize: '16px',
};

const textStyle = {
  color: '#5d6d7e',
  lineHeight: '1.6',
  marginBottom: '20px',
  fontSize: '16px',
};

const paperDetailsBoxStyle = {
  backgroundColor: '#e8f4f8',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #3498db',
};

const subHeadingStyle = {
  color: '#2c3e50',
  marginBottom: '15px',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 15px 0',
};

const detailItemStyle = {
  margin: '8px 0',
  color: '#34495e',
  fontSize: '14px',
  lineHeight: '1.5',
};

const statusBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
  borderLeft: '4px solid',
  textAlign: 'center' as const,
};

const statusBadgeStyle = {
  padding: '12px 20px',
  borderRadius: '6px',
  margin: '0 auto 15px auto',
  display: 'inline-block',
};

const statusTextStyle = {
  margin: '0',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
};

const statusMessageStyle = {
  color: '#2c3e50',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const publicationBoxStyle = {
  backgroundColor: '#d1ecf1',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #17a2b8',
  textAlign: 'center' as const,
};

const publicationTextStyle = {
  margin: '0',
  color: '#0c5460',
  fontSize: '16px',
};

const deadlineBoxStyle = {
  backgroundColor: '#fff3cd',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #ffc107',
  textAlign: 'center' as const,
};

const deadlineTextStyle = {
  margin: '0',
  color: '#856404',
  fontSize: '16px',
};

const commentsBoxStyle = {
  backgroundColor: '#f1f3f4',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #e9ecef',
};

const reviewerCommentsBoxStyle = {
  backgroundColor: '#e8f5e8',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #d4edda',
};

const commentsHeadingStyle = {
  color: '#2c3e50',
  marginBottom: '10px',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const commentsTextStyle = {
  color: '#5d6d7e',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const nextStepsBoxStyle = {
  backgroundColor: '#d1ecf1',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #17a2b8',
};

const nextStepsTextStyle = {
  margin: '0',
  color: '#0c5460',
  fontSize: '14px',
  lineHeight: '1.6',
};

const revisionStepsBoxStyle = {
  backgroundColor: '#ffeaa7',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #fdcb6e',
};

const revisionStepsTextStyle = {
  margin: '0',
  color: '#6c5208',
  fontSize: '14px',
  lineHeight: '1.6',
};

const rejectionStepsBoxStyle = {
  backgroundColor: '#f8d7da',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #f5c6cb',
};

const rejectionStepsTextStyle = {
  margin: '0',
  color: '#721c24',
  fontSize: '14px',
  lineHeight: '1.6',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const primaryButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '14px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '16px',
  margin: '0 10px 10px 0',
};

const secondaryButtonStyle = {
  backgroundColor: '#6c757d',
  color: 'white',
  padding: '14px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '16px',
  margin: '0 10px 10px 0',
};

const hrStyle = {
  margin: '30px 0',
  border: 'none',
  borderTop: '1px solid #e9ecef',
};

const footerStyle = {
  color: '#6c757d',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.5',
};
