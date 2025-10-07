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
} from "@react-email/components";
import * as React from "react";

export default function PaperUploadEmail( paper:ResearchPaper ) {
  return (
    <Html lang="en">
      <Head>
        <title>Manuscript Submission Confirmation</title>
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
      <Preview>
        Manuscript submission confirmation for "{paper.title}"
      </Preview>

      <Container style={containerStyle}>
        <Section style={headerStyle}>
          <Text style={titleStyle}>
            Manuscript Submission Confirmation
          </Text>
        </Section>

        <Hr style={hrStyle} />

        <Section style={contentStyle}>
         
          <Text style={paragraphStyle}>
            We acknowledge receipt of your manuscript submission to the Journal of Embedded and Digital System Design (JEDSD).
          </Text>

          <Text style={paragraphStyle}>
            <strong>Manuscript Details:</strong>
          </Text>

          <Section style={detailsBoxStyle}>
            <Text style={detailItemStyle}>
              <strong>Manuscript ID:</strong> {paper.id}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Title:</strong> {paper.title}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Submission Date:</strong> {new Date(paper.submissionDate).toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </Section>

          <Text style={paragraphStyle}>
            Your manuscript has been successfully uploaded to our submission system and will now 
            proceed through our peer review process. You will receive further communication 
            regarding the status of your submission at each stage of the review.
          </Text>

          <Text style={paragraphStyle}>
            Please retain this manuscript ID for your records and reference it in all future 
            correspondence regarding this submission.
          </Text>

          <Text style={paragraphStyle}>
            Should you have any questions or require assistance, please do not hesitate to 
            contact our editorial office.
          </Text>

          <Hr style={hrStyle} />

          <Text style={closingStyle}>
            Sincerely,
          </Text>
          <Text style={signatureStyle}>
            <strong>The JEDSD Editorial Team</strong>
            <br />
            Journal of Embedded and Digital System Design
          </Text>
        </Section>

        <Section style={footerStyle}>
          <Text style={footerTextStyle}>
            This is an automated confirmation email. Please do not reply directly to this message.
          </Text>
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