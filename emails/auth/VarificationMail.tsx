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
  Hr,
  Container,
} from '@react-email/components';

interface VerificationEmailProps {
  name?: string;
  otp: string;
}

export default function VerificationEmail({ name, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>Your verification code is inside 🚀</Preview>

      <Container style={{ backgroundColor: '#f9fafb', padding: '40px 20px' }}>
        <Section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Row>
            <Heading
              as="h2"
              style={{
                fontFamily: 'Roboto, Verdana, sans-serif',
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#111827',
              }}
            >
              👋 Hello {name || 'there'},
            </Heading>
          </Row>

          <Row>
            <Text
              style={{
                fontSize: '16px',
                color: '#374151',
                lineHeight: '24px',
                marginBottom: '20px',
              }}
            >
              Thanks for signing up! Use the code below to verify your account
              and unlock full access:
            </Text>
          </Row>

          <Row>
            <Text
              style={{
                fontSize: '28px',
                fontWeight: '700',
                letterSpacing: '4px',
                color: '#2563eb',
                textAlign: 'center',
                margin: '20px 0',
              }}
            >
              {otp}
            </Text>
          </Row>

          <Row style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button
              href="https://www.jedsd.com/verify"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Verify My Account
            </Button>
          </Row>

          <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0' }} />

          <Row>
            <Text
              style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '22px',
              }}
            >
              If you didn’t request this code, you can safely ignore this
              message. Your account will remain secure.
            </Text>
          </Row>
        </Section>

        <Text
          style={{
            fontSize: '12px',
            textAlign: 'center',
            color: '#9ca3af',
            marginTop: '20px',
          }}
        >
          © {new Date().getFullYear()} JEDSD. All rights reserved.<br />
          For assistance, contact us at editorial@jedsd.com.
        </Text>
      </Container>
    </Html>
  );
}
