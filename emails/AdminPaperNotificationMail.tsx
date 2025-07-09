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

interface AdminPaperNotificationEmailProps {
  adminName: string;
  paperTitle: string;
  action: string;
  paperStatus: string;
  submissionDate: string;
  paperId: string;
  dashboardUrl?: string;
}

export default function AdminPaperNotificationEmail({
  adminName,
  paperTitle,
  action,
  paperStatus,
  submissionDate,
  paperId,
  dashboardUrl = 'http://localhost:3000/dashboard'
}: AdminPaperNotificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Admin Alert: {action}</title>
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
      <Preview>Admin notification regarding paper activity in the JEDSD system</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Admin Notification
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {adminName},
          </Text>
          
          <Text style={textStyle}>
            This is an administrative notification regarding paper activity in the JEDSD system.
          </Text>
          
          <Section style={detailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Paper Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Title:</strong> {paperTitle}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Action:</strong> {action}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Status:</strong> {paperStatus}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Submission Date:</strong> {submissionDate}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Paper ID:</strong> {paperId}
            </Text>
          </Section>
          
          <Section style={alertBoxStyle}>
            <Text style={alertTextStyle}>
              <strong>Admin Action:</strong> Please review this activity and take appropriate action if needed.
            </Text>
          </Section>
          
          <Section style={buttonSectionStyle}>
            <Button style={buttonStyle} href={dashboardUrl}>
              View Admin Dashboard
            </Button>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            This is an automated administrative message from JEDSD. Please do not reply to this email.
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

const alertBoxStyle = {
  backgroundColor: '#d4edda',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #28a745',
};

const alertTextStyle = {
  margin: '0',
  color: '#155724',
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
