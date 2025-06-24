import { ResearchPaper, User } from "@prisma/client";
import {
  Html,
  Head,
  Font,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface ReviewerAllocationEmailProps {
  paper: ResearchPaper;
  reviewer: User;
}

export default function ReviewerAllocationEmail({
  paper,
  reviewer
}: ReviewerAllocationEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Reviewer Assigned</title>
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
        Reviewer "{reviewer.name}" has been assigned to review the paper "{paper.title}".
      </Preview>

      <Section>
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Reviewer Allocation Notification
        </Text>

        <Text>
          A reviewer has been successfully assigned to the paper titled <strong>{paper.title}</strong>.
        </Text>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontFamily: "Roboto, Verdana, sans-serif",
            fontSize: "14px",
          }}
        >
          <tbody>
            <tr>
              <td style={tdStyle}>Title</td>
              <td style={tdStyle}>{paper.title}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Abstract</td>
              <td style={tdStyle}>{paper.abstract}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Keywords</td>
              <td style={tdStyle}>{paper.keywords.join(", ")}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Version</td>
              <td style={tdStyle}>{paper.currentVersion}</td>
            </tr>
            <tr>
              <td style={tdStyle}>Submission Date</td>
              <td style={tdStyle}>
                {new Date(paper.submissionDate).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Status</td>
              <td style={tdStyle}>{paper.status}</td>
            </tr>
           
            <tr>
              <td style={tdStyle}>Point of Contact</td>
              <td style={tdStyle}>
                {paper.pointOfContact && typeof paper.pointOfContact === "object" &&
                "name" in paper.pointOfContact &&
                "email" in paper.pointOfContact &&
                "phone" in paper.pointOfContact ? (
                  <>
                    {(paper.pointOfContact as { name: string; email: string; phone: string }).name}<br />
                    {(paper.pointOfContact as { name: string; email: string; phone: string }).email}<br />
                    {(paper.pointOfContact as { name: string; email: string; phone: string }).phone}
                  </>
                ) : (
                  <em>Not provided</em>
                )}
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Contributors</td>
              <td style={tdStyle}>
                <pre>{JSON.stringify(paper.contributors, null, 2)}</pre>
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={{ marginTop: "20px" }}>
          <strong>Download Paper:</strong>
        </Text>
        <Button
          href={paper.filePath}
          style={{
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "5px",
            textDecoration: "none",
            display: "inline-block",
            marginTop: "10px",
          }}
        >
          Download Paper
        </Button>

        <Text style={{ marginTop: "30px" }}>
          The reviewer will be notified and begin the review process. You will be updated once a review decision is made.
        </Text>

        <Text>If you have any questions, feel free to contact us.</Text>

        <Text>
          Best regards, <br />
          <strong>The JEDSD Editorial Team</strong>
        </Text>

        
      </Section>
    </Html>
  );
}

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  verticalAlign: "top" as const,
};
