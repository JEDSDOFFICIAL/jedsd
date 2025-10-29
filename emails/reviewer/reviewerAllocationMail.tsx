import { ResearchPaper, User } from "@prisma/client";
import {
  Html,
  Head,
  Font,
  Preview,
  Section,
  Text,
  Button,
  Container,
  Hr,
} from "@react-email/components";

interface ReviewerAllocationEmailProps {
  paper: ResearchPaper;
  revieweremail: string;
  reviewerName: string;
}

export default function ReviewerAllocationEmail({
  paper,
  revieweremail,
  reviewerName,
}: ReviewerAllocationEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Manuscript Review Assignment</title>
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

      <Preview>Review Request: "{paper.title}" - JEDSD Journal</Preview>

      <Container style={containerStyle}>
        <Section style={headerStyle}>
          <Text style={titleStyle}>Manuscript Review Assignment</Text>
        </Section>

        <Hr style={hrStyle} />

        <Section style={contentStyle}>
          <Text style={greetingStyle}>Dear {reviewerName},</Text>

          <Text style={paragraphStyle}>
            We are writing to request your expertise as a reviewer for a
            manuscript submitted to the Journal of Embedded and Digital System
            Design(JEDSD).
          </Text>

          <Text style={paragraphStyle}>
            Based on your expertise and research background, we believe you
            would be an excellent reviewer for this manuscript. We would be
            grateful if you could accept this review assignment.
          </Text>

          {/* Manuscript Details */}
          <Text style={sectionHeaderStyle}>Manuscript Details</Text>

          <Section style={detailsBoxStyle}>
            <table style={tableStyle}>
              <tbody>
                <tr>
                  <td style={labelCellStyle}>Manuscript ID:</td>
                  <td style={valueCellStyle}>{paper.paperId}</td>
                </tr>
                <tr>
                  <td style={labelCellStyle}>Title:</td>
                  <td style={valueCellStyle}>
                    <strong>{paper.title}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={labelCellStyle}>Keywords:</td>
                  <td style={valueCellStyle}>{paper.keywords.join(", ")}</td>
                </tr>
                <tr>
                  <td style={labelCellStyle}>Submission Date:</td>
                  <td style={valueCellStyle}>
                    {new Date(paper.submissionDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Abstract */}
          <Text style={sectionHeaderStyle}>Abstract</Text>
          <Section style={abstractBoxStyle}>
            <Text style={abstractTextStyle}>{paper.abstract}</Text>
          </Section>

          {/* Action Buttons */}
          <Text style={actionPromptStyle}>
            Please review the manuscript details above or check it
          </Text>
          <Button
            style={acceptButtonStyle}
            href="https://www.jedsd.com/dashboard"
          >
            Go to Dashboard
          </Button>
          {/* Download Paper */}
          <Section style={downloadSectionStyle}>
            <Text style={downloadTextStyle}>
              You can download the full manuscript using the button below:
            </Text>
            <Button href={paper.filePath} style={downloadButtonStyle}>
              Download Manuscript (PDF)
            </Button>
          </Section>
          {paper.coverLetterPath && (
            <Section style={downloadSectionStyle}>
              <Text style={downloadTextStyle}>
                You can download the cover letter using the button below:
              </Text>
              <Button href={paper.coverLetterPath} style={downloadButtonStyle}>
                Download Cover Letter (PDF)
              </Button>
            </Section>
          )}

          {/* Review Guidelines */}
          <Text style={guidelinesHeaderStyle}>Review Timeline</Text>
          <Text style={paragraphStyle}>
            If you accept this assignment, we kindly request that you complete
            your review within <strong>3 weeks</strong> from the date of
            acceptance. If you require additional time, please contact our
            editorial office.
          </Text>

          <Hr style={hrStyle} />

          {/* Contact Information */}
          <Text style={paragraphStyle}>
            Should you have any questions or require additional information,
            please do not hesitate to contact our editorial office.
          </Text>

          <Text style={closingStyle}>
            Thank you for your consideration and continued support of JEDSD.
          </Text>

          <Text style={signatureStyle}>
            Sincerely,
            <br />
            <strong>The JEDSD Editorial Team</strong>
            <br />
            Journal of Embedded and DIgital System Design
          </Text>
        </Section>

        <Section style={footerStyle}>
          <Text style={footerTextStyle}>
            This email was sent to {revieweremail}. If you believe you received
            this email in error, please contact our editorial office.
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
  padding: "30px",
  backgroundColor: "#0f172a",
  borderRadius: "8px 8px 0 0",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0",
  textAlign: "center" as const,
};

const hrStyle = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const contentStyle = {
  padding: "30px",
  backgroundColor: "#ffffff",
};

const greetingStyle = {
  fontSize: "16px",
  color: "#1f2937",
  marginBottom: "20px",
  fontWeight: "500",
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  marginBottom: "16px",
};

const sectionHeaderStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1f2937",
  marginTop: "30px",
  marginBottom: "16px",
};

const detailsBoxStyle = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "24px",
  border: "1px solid #e5e7eb",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const labelCellStyle = {
  padding: "10px 16px 10px 0",
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: "500",
  verticalAlign: "top" as const,
  width: "35%",
};

const valueCellStyle = {
  padding: "10px 0",
  fontSize: "14px",
  color: "#1f2937",
  verticalAlign: "top" as const,
};

const abstractBoxStyle = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "24px",
  border: "1px solid #e5e7eb",
};

const abstractTextStyle = {
  fontSize: "14px",
  lineHeight: "1.7",
  color: "#374151",
  margin: "0",
  textAlign: "justify" as const,
};

const actionPromptStyle = {
  fontSize: "16px",
  fontWeight: "500",
  color: "#1f2937",
  marginTop: "30px",
  marginBottom: "20px",
  textAlign: "center" as const,
};

const buttonContainerStyle = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const acceptButtonStyle = {
  backgroundColor: "#10b981",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px",
  fontSize: "15px",
  fontWeight: "600",
  border: "none",
};

const rejectButtonStyle = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px",
  fontSize: "15px",
  fontWeight: "600",
  border: "none",
};

const downloadSectionStyle = {
  textAlign: "center" as const,
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  marginBottom: "24px",
};

const downloadTextStyle = {
  fontSize: "14px",
  color: "#6b7280",
  marginBottom: "16px",
};

const downloadButtonStyle = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  border: "none",
};

const guidelinesHeaderStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1f2937",
  marginTop: "30px",
  marginBottom: "12px",
};

const closingStyle = {
  fontSize: "15px",
  color: "#374151",
  marginTop: "24px",
  marginBottom: "16px",
};

const signatureStyle = {
  fontSize: "15px",
  color: "#1f2937",
  lineHeight: "1.6",
  marginBottom: "0",
};

const footerStyle = {
  padding: "20px 30px",
  backgroundColor: "#f9fafb",
  borderRadius: "0 0 8px 8px",
  borderTop: "1px solid #e5e7eb",
};

const footerTextStyle = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
  lineHeight: "1.5",
  margin: "0",
};
