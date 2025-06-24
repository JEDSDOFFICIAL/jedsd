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
  } from "@react-email/components";
  
  interface VerificationEmailProps {
    username: string;

  }
  
  export default function SuccessAuthentication({ username }: VerificationEmailProps) {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <title>Thank you for joining with JEDSD</title>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Preview>Your Username is {username}</Preview>
        <Container style={{ backgroundColor: "#f4f4f4", padding: "20px", borderRadius: "8px" }}>
          <Section style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "8px", textAlign: "center", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
            <Heading as="h2" style={{ color: "#333", fontSize: "24px", marginBottom: "10px" }}>
              Hello, {username}!
            </Heading>
            <Text style={{ color: "#555", fontSize: "16px", marginBottom: "20px" }}>
              Thank you for registering. We are excited to have you on board. Your account has been successfully created.
            </Text>
            
            <Text style={{ color: "#777", fontSize: "14px", marginTop: "20px" }}>
                If you have any questions, feel free to contact us at support@jedsd.com.
            </Text>
          </Section>
        </Container>
      </Html>
    );
  }
  