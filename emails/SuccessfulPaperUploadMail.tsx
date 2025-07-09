import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
  Container,
  Hr,
} from '@react-email/components';

interface SuccessfulPaperUploadEmailProps {
  authorName: string;
  paperTitle: string;
  submissionDate: string;
  submissionId: string;
  dashboardUrl?: string;
}

export default function SuccessfulPaperUploadEmail({
  authorName,
  paperTitle,
  submissionDate,
  submissionId,
  dashboardUrl = 'http://localhost:3000/dashboard'
}: SuccessfulPaperUploadEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Paper Submission Successful</title>
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
      <Preview>Your paper has been successfully submitted</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Paper Submission Successful
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {authorName},
          </Text>
          
          <Text style={textStyle}>
            Congratulations! Your paper has been successfully submitted to the JEDSD system.
          </Text>
          
          <Section style={detailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Submission Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Paper Title:</strong> {paperTitle}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Submission Date:</strong> {submissionDate}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Submission ID:</strong> {submissionId}
            </Text>
          </Section>
          
          <Section style={successBoxStyle}>
            <Text style={successTextStyle}>
              <strong>What's Next?</strong> Your paper is now in the review queue. Our editorial team will review your submission and assign it to appropriate reviewers. You will receive email notifications about any status updates.
            </Text>
          </Section>
          
          <Section style={infoBoxStyle}>
            <Text style={infoTextStyle}>
              <strong>Important:</strong> Please keep your submission ID for future reference. You can track the status of your submission through your dashboard.
            </Text>
          </Section>
          
          <Section style={buttonSectionStyle}>
            <Button style={buttonStyle} href={dashboardUrl}>
              View Dashboard
            </Button>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            Thank you for choosing JEDSD for your publication needs. This is an automated message - please do not reply to this email.
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
  backgroundColor: '#f9f9f9',
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const headingStyle = {
  color: '#333',
  marginBottom: '20px',
  fontSize: '24px',
  fontWeight: '600',
};

const greetingStyle = {
  color: '#666',
  lineHeight: '1.6',
  marginBottom: '20px',
  fontSize: '16px',
};

const textStyle = {
  color: '#666',
  lineHeight: '1.6',
  marginBottom: '20px',
  fontSize: '16px',
};

const detailsBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
};

const subHeadingStyle = {
  color: '#333',
  marginTop: '0',
  marginBottom: '15px',
  fontSize: '18px',
  fontWeight: '600',
};

const detailItemStyle = {
  margin: '8px 0',
  color: '#555',
  fontSize: '14px',
};

const successBoxStyle = {
  backgroundColor: '#d4edda',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #28a745',
};

const successTextStyle = {
  margin: '0',
  color: '#155724',
  fontSize: '14px',
};

const infoBoxStyle = {
  backgroundColor: '#d1ecf1',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #17a2b8',
};

const infoTextStyle = {
  margin: '0',
  color: '#0c5460',
  fontSize: '14px',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '14px',
};

const hrStyle = {
  margin: '30px 0',
  border: 'none',
  borderTop: '1px solid #eee',
};

const footerStyle = {
  color: '#999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};
