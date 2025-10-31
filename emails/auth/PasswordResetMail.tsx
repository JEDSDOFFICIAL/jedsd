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

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  name,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Password Reset Request</title>
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
      <Preview>Reset your JEDSD password</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Password Reset Request
          </Heading>
          
          <Text style={greetingStyle}>
            Hello {name},
          </Text>
          
          <Text style={textStyle}>
            We received a request to reset your password for your JEDSD account. Click the button below to reset your password.
          </Text>
          
          <Section style={buttonSectionStyle}>
            <Button style={buttonStyle} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={textStyle}>
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </Text>
          
          <Section style={infoBoxStyle}>
            <Text style={infoTextStyle}>
              <strong>Security Note:</strong> This link will expire in 1 hour for security reasons.
            </Text>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            This is an automated message from JEDSD. Please do not reply to this email.<br />
            For assistance, contact us at editorial@jedsd.com.
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

const infoBoxStyle = {
  backgroundColor: '#fff3cd',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #ffc107',
};

const infoTextStyle = {
  margin: '0',
  color: '#856404',
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
