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

interface EditorPaperAllocationEmailProps {
  editorName: string;
  paperTitle: string;
  paperAbstract: string;
  authorName: string;
  submissionDate: string;
  reviewerStatus?: string;
  editUrl?: string;
}

export default function EditorPaperAllocationEmail({
  editorName,
  paperTitle,
  paperAbstract,
  authorName,
  submissionDate,
  reviewerStatus,
  editUrl = 'http://localhost:3000/dashboard'
}: EditorPaperAllocationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - New Paper Assignment for Editing</title>
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
      <Preview>New paper assigned for your editing</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            New Paper Assignment
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {editorName},
          </Text>
          
          <Text style={textStyle}>
            You have been assigned a new paper to edit in the JEDSD system. Please find the details below:
          </Text>
          
          <Section style={detailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Paper Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Title:</strong> {paperTitle}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Author:</strong> {authorName}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Submission Date:</strong> {submissionDate}
            </Text>
            {reviewerStatus && (
              <Text style={detailItemStyle}>
                <strong>Reviewer Status:</strong> {reviewerStatus}
              </Text>
            )}
          </Section>
          
          <Section style={abstractBoxStyle}>
            <Heading as="h4" style={abstractHeadingStyle}>
              Abstract:
            </Heading>
            <Text style={abstractTextStyle}>
              {paperAbstract}
            </Text>
          </Section>
          
          <Section style={instructionsBoxStyle}>
            <Text style={instructionsTextStyle}>
              <strong>Next Steps:</strong> Please review the paper and provide your editorial feedback. You can accept or reject the paper for editing through the dashboard.
            </Text>
          </Section>
          
          <Section style={buttonSectionStyle}>
            <Button style={buttonStyle} href={editUrl}>
              Start Editing
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

const abstractBoxStyle = {
  backgroundColor: '#fff3cd',
  padding: '15px',
  borderRadius: '8px',
  margin: '15px 0',
  borderLeft: '4px solid #ffc107',
};

const abstractHeadingStyle = {
  color: '#333',
  marginTop: '0',
  marginBottom: '10px',
  fontSize: '16px',
  fontWeight: '600',
};

const abstractTextStyle = {
  color: '#555',
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const instructionsBoxStyle = {
  backgroundColor: '#d1ecf1',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #17a2b8',
};

const instructionsTextStyle = {
  margin: '0',
  color: '#0c5460',
  fontSize: '14px',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const buttonStyle = {
  backgroundColor: '#6f42c1',
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
