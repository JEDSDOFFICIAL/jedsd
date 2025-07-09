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

interface AuthorPaperStatusUpdateEmailProps {
  authorName: string;
  paperTitle: string;
  newStatus: string;
  reviewerNotes?: string;
  editorNotes?: string;
  dashboardUrl?: string;
}

export default function AuthorPaperStatusUpdateEmail({
  authorName,
  paperTitle,
  newStatus,
  reviewerNotes,
  editorNotes,
  dashboardUrl = 'http://localhost:3000/dashboard'
}: AuthorPaperStatusUpdateEmailProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'published':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      case 'under_review':
        return '#ffc107';
      default:
        return '#007bff';
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
      <Preview>Your paper status has been updated</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Paper Status Update
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {authorName},
          </Text>
          
          <Text style={textStyle}>
            We wanted to update you on the status of your paper submission.
          </Text>
          
          <Section style={detailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Paper Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Title:</strong> {paperTitle}
            </Text>
            <Text style={detailItemStyle}>
              <strong>New Status:</strong> 
              <span style={{...statusStyle, color: getStatusColor(newStatus)}}>
                {newStatus}
              </span>
            </Text>
          </Section>
          
          {reviewerNotes && (
            <Section style={notesBoxStyle}>
              <Heading as="h4" style={notesHeadingStyle}>
                Reviewer Notes:
              </Heading>
              <Text style={notesTextStyle}>
                {reviewerNotes}
              </Text>
            </Section>
          )}
          
          {editorNotes && (
            <Section style={notesBoxStyle}>
              <Heading as="h4" style={notesHeadingStyle}>
                Editor Notes:
              </Heading>
              <Text style={notesTextStyle}>
                {editorNotes}
              </Text>
            </Section>
          )}
          
          <Section style={buttonSectionStyle}>
            <Button style={buttonStyle} href={dashboardUrl}>
              View Dashboard
            </Button>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            This is an automated message from JEDSD. Please do not reply to this email.
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

const statusStyle = {
  fontWeight: 'bold',
  marginLeft: '5px',
};

const notesBoxStyle = {
  backgroundColor: '#e9ecef',
  padding: '15px',
  borderRadius: '8px',
  margin: '15px 0',
  borderLeft: '4px solid #6c757d',
};

const notesHeadingStyle = {
  color: '#333',
  marginTop: '0',
  marginBottom: '10px',
  fontSize: '16px',
  fontWeight: '600',
};

const notesTextStyle = {
  color: '#555',
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.5',
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
