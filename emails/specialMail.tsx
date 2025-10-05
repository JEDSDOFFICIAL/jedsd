import { ResearchPaper } from "@prisma/client";
import {
  Html,
  Head,
  Font,
  Preview,
  Section,
  Text,
  Container,
  Hr,
  Button,
} from "@react-email/components";
import * as React from "react";

export default function specialMail(paper: ResearchPaper) {
  return (
    <Html lang="en">
      <Head>
        <title>New Manuscript Submission</title>
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
      <Preview>New manuscript submission for "{paper.title}"</Preview>

      <Container style={containerStyle}>
        <Section style={headerStyle}>
          <Text style={titleStyle}>New Manuscript Submission</Text>
        </Section>
        <Section>
          <Text>Go and Check the Manuscript</Text>
          <Button
          href="https://www.jedsd.com/dashboard"
            style={{
              backgroundColor: "lightblue",
              color: "black",
              paddingLeft: "3px",
              paddingRight: "3px",
              textAlign:"center",
              fontSize:"20px"
            }}
          >
            Visit
          </Button>
        </Section>
      </Container>
    </Html>
  );
}

// Styles
const containerStyle = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
  fontFamily: "Roboto, Verdana, sans-serif",
};

const headerStyle = {
  padding: "20px 30px",
  backgroundColor: "#f8f9fa",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
  textAlign: "center" as const,
};

const hrStyle = {
  borderColor: "#e0e0e0",
  margin: "20px 0",
};

const contentStyle = {
  padding: "0 30px",
};

const greetingStyle = {
  fontSize: "16px",
  color: "#1a1a1a",
  marginBottom: "20px",
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#333333",
  marginBottom: "16px",
};

const detailsBoxStyle = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "6px",
  marginBottom: "20px",
  border: "1px solid #e0e0e0",
};

const detailItemStyle = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#333333",
  margin: "8px 0",
};

const closingStyle = {
  fontSize: "15px",
  color: "#333333",
  marginTop: "30px",
  marginBottom: "8px",
};

const signatureStyle = {
  fontSize: "15px",
  color: "#1a1a1a",
  lineHeight: "1.6",
};

const footerStyle = {
  padding: "20px 30px",
  marginTop: "30px",
  borderTop: "1px solid #e0e0e0",
};

const footerTextStyle = {
  fontSize: "13px",
  color: "#666666",
  textAlign: "center" as const,
  fontStyle: "italic",
};
