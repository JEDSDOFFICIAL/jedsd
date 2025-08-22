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
} from '@react-email/components';

interface ReviewerAcceptanceEmailProps {
  editorName: string;
  reviewerName: string;
  paperTitle: string;
  paperId: string;
  acceptanceStatus: 'ACCEPTED_FOR_REVIEW' | 'REJECTED_FOR_REVIEW';
  reviewDeadline?: string;
  dashboardUrl?: string;
}

export default function ReviewerAcceptanceEmail({
  editorName,
  reviewerName,
  paperTitle,
  paperId,
  acceptanceStatus,
  reviewDeadline,
  dashboardUrl = 'http://localhost:3000/dashboard'
}: ReviewerAcceptanceEmailProps) {
  const isAccepted = acceptanceStatus === 'ACCEPTED_FOR_REVIEW';
  
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Reviewer Response Update</title>
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
      <Preview>
        Reviewer {isAccepted ? 'accepted' : 'declined'} review assignment
      </Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Reviewer Assignment Update
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {editorName},
          </Text>
          
          <Text style={textStyle}>
            We have an update regarding the reviewer assignment for one of your papers.
          </Text>
          
          <Section style={detailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Assignment Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Paper:</strong> {paperTitle}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Paper ID:</strong> {paperId}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Reviewer:</strong> {reviewerName}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Status:</strong> 
              <span style={isAccepted ? acceptedStatusStyle : rejectedStatusStyle}>
                {isAccepted ? ' ACCEPTED FOR REVIEW' : ' DECLINED REVIEW'}
              </span>
            </Text>
            {isAccepted && reviewDeadline && (
              <Text style={detailItemStyle}>
                <strong>Review Deadline:</strong> {reviewDeadline}
              </Text>
            )}
          </Section>
          
          <Section style={instructionsBoxStyle}>
            <Text style={instructionsTextStyle}>
              {isAccepted ? (
                <>
                  <strong>Next Steps:</strong> The reviewer has accepted the assignment and will begin the review process. 
                  You will be notified once the review is completed.
                </>
              ) : (
                <>
                  <strong>Action Required:</strong> The reviewer has declined this assignment. 
                  Please assign a new reviewer from your dashboard to continue the review process.
                </>
              )}
            </Text>
          </Section>
          
          <Section style={buttonSectionStyle}>
            <Button href={dashboardUrl} style={buttonStyle}>
              Go to Editor Dashboard
            </Button>
          </Section>
          
          <Hr style={separatorStyle} />
          
          <Text style={footerStyle}>
            Best regards,<br />
            JEDSD Editorial Team
          </Text>
          
          <Text style={disclaimerStyle}>
            This is an automated message from the JEDSD system. Please do not reply to this email.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

// Styles
const containerStyle = {
  margin: '0 auto',
  padding: '20px 0 48px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f8fafc',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
};

const headingStyle = {
  fontSize: '28px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1f2937',
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const greetingStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6b7280',
  marginBottom: '24px',
};

const detailsBoxStyle = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '6px',
  marginBottom: '24px',
};

const subHeadingStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '16px',
};

const detailItemStyle = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
  marginBottom: '8px',
};

const acceptedStatusStyle = {
  color: '#059669',
  fontWeight: '600',
};

const rejectedStatusStyle = {
  color: '#dc2626',
  fontWeight: '600',
};

const instructionsBoxStyle = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '6px',
  marginBottom: '32px',
  border: '1px solid #f59e0b',
};

const instructionsTextStyle = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#92400e',
  margin: '0',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const buttonStyle = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
};

const separatorStyle = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerStyle = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  marginBottom: '16px',
};

const disclaimerStyle = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#9ca3af',
  fontStyle: 'italic',
};
