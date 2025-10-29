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

// Helper function to format date nicely
function formatDate(date: Date | undefined | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function editorMail(paper: ResearchPaper) {
  return (
    <Html lang="en">
      <Head>
        <title>New Manuscript Submission - Editor Review Required</title>
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
      <Preview>Editor Action Required: New manuscript "{paper.title}" awaiting review</Preview>
      <Container style={containerStyle}>
        <Section style={headerStyle}>
          <Text style={titleStyle}>📝 New Manuscript Submission</Text>
          <Text style={subtitleStyle}>Editor Review Required</Text>
        </Section>

        <Section style={alertStyle}>
          <Text style={alertTextStyle}>
            ⚠️ A new manuscript has been submitted and requires your editorial review.
          </Text>
        </Section>

        <Section style={contentStyle}>
          <Text style={sectionHeaderStyle}>Manuscript Details</Text>
          
          <Text style={paragraphStyle}>
            <strong>Title:</strong> {paper.title}
          </Text>

          <Text style={paragraphStyle}>
            <strong>Manuscript ID:</strong> {paper.paperId}
          </Text>

          <Text style={paragraphStyle}>
            <strong>Submission Date:</strong> {formatDate(paper.submissionDate)}
          </Text>

          <Text style={paragraphStyle}>
            <strong>Current Status:</strong> <span style={statusBadgeStyle}>{paper.status}</span>
          </Text>

          <Hr style={dividerStyle} />

          <Text style={sectionHeaderStyle}>Author Information</Text>
          
         

          <Hr style={dividerStyle} />

          <Text style={sectionHeaderStyle}>Abstract</Text>
          <Text style={abstractStyle}>{paper.abstract}</Text>

          <Hr style={dividerStyle} />

          <Text style={sectionHeaderStyle}>Keywords</Text>
          <Text style={paragraphStyle}>
            {paper.keywords ? paper.keywords.join(" • ") : "No keywords provided"}
          </Text>

         
        </Section>

        <Section style={actionSectionStyle}>
          <Text style={actionHeaderStyle}>Editor Actions</Text>
          
          <Section style={buttonContainerStyle}>
            <Button
              href={`https://www.jedsd.com/dashboard`}
              style={primaryButtonStyle}
            >
              Review Manuscript
            </Button>
          </Section>

         

          <Section style={buttonContainerStyle}>
            <Button
              href="https://www.jedsd.com/dashboard"
              style={tertiaryButtonStyle}
            >
              View All Submissions
            </Button>
          </Section>
        </Section>

        <Section style={infoBoxStyle}>
          <Text style={infoTextStyle}>
            <strong>Next Steps:</strong>
          </Text>
          <Text style={infoTextStyle}>
            1. Review the manuscript for initial compliance and scope fit
          </Text>
          <Text style={infoTextStyle}>
            2. Assign appropriate peer reviewers (minimum 2 recommended)
          </Text>
          <Text style={infoTextStyle}>
            3. Monitor the review process and provide editorial decisions
          </Text>
        </Section>

        <Section style={footerStyle}>
          <Text style={footerTextStyle}>
            This is an automated notification from JEDSD Manuscript Submission System.
          </Text>
          <Text style={footerTextStyle}>
            Please do not reply to this email. For support, visit the editor dashboard.
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
  maxWidth: "650px",
  fontFamily: "Roboto, Verdana, sans-serif",
  backgroundColor: "#ffffff",
};

const headerStyle = {
  padding: "30px 30px 20px",
  backgroundColor: "#1e3a8a",
  borderRadius: "8px 8px 0 0",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const subtitleStyle = {
  fontSize: "16px",
  fontWeight: "400",
  color: "#bfdbfe",
  margin: "0",
  textAlign: "center" as const,
};

const alertStyle = {
  padding: "20px 30px",
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  margin: "20px 0",
};

const alertTextStyle = {
  fontSize: "15px",
  color: "#92400e",
  margin: "0",
  fontWeight: "500",
};

const contentStyle = {
  padding: "0 30px",
};

const sectionHeaderStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1e3a8a",
  marginTop: "24px",
  marginBottom: "12px",
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#333333",
  marginBottom: "12px",
};

const abstractStyle = {
  fontSize: "14px",
  lineHeight: "1.7",
  color: "#4b5563",
  marginBottom: "16px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  fontStyle: "italic",
};

const statusBadgeStyle = {
  display: "inline-block",
  padding: "4px 12px",
  backgroundColor: "#dbeafe",
  color: "#1e40af",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
};

const dividerStyle = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const actionSectionStyle = {
  padding: "30px 30px 20px",
  backgroundColor: "#f8fafc",
  margin: "30px 0",
  borderRadius: "8px",
};

const actionHeaderStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1e3a8a",
  marginBottom: "20px",
  textAlign: "center" as const,
};

const buttonContainerStyle = {
  textAlign: "center" as const,
  marginBottom: "12px",
};

const primaryButtonStyle = {
  backgroundColor: "#1e3a8a",
  color: "#ffffff",
  padding: "14px 32px",
  textAlign: "center" as const,
  fontSize: "16px",
  fontWeight: "600",
  borderRadius: "6px",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const secondaryButtonStyle = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 28px",
  textAlign: "center" as const,
  fontSize: "15px",
  fontWeight: "500",
  borderRadius: "6px",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const tertiaryButtonStyle = {
  backgroundColor: "#e5e7eb",
  color: "#374151",
  padding: "10px 24px",
  textAlign: "center" as const,
  fontSize: "14px",
  fontWeight: "500",
  borderRadius: "6px",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const infoBoxStyle = {
  padding: "20px 30px",
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  margin: "20px 0",
};

const infoTextStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#1e40af",
  margin: "6px 0",
};

const footerStyle = {
  padding: "20px 30px",
  marginTop: "30px",
  borderTop: "2px solid #e5e7eb",
};

const footerTextStyle = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
  fontStyle: "italic",
  margin: "4px 0",
};