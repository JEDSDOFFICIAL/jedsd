import { ResearchPaper } from "@prisma/client";
import {
  Html,
  Head,
  Font,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

export default function PaperUploadEmail(paper: ResearchPaper) {
  interface Contact {
    fullName: string;
    email: string;
  }

  interface Contributor {
    fullName: string;
    email: string;
  }

  interface PaperUploadEmailProps extends Omit<ResearchPaper, "pointOfContact" | "contributors"> {
    pointOfContact?: Contact | null;
    contributors?: Contributor[];
  }

  const formatContact = (contact: Contact | null | undefined): React.JSX.Element => {
    if (!contact) return <em>Not provided</em>;
    return (
      <>
        {contact.fullName} <br />
        {contact.email}
      </>
    );
  };

  interface FormatContributorsProps {
    fullName: string;
    email: string;
  }

  const formatContributors = (contributors: FormatContributorsProps[] | undefined | null): React.JSX.Element | string => {
    if (!contributors || contributors.length === 0)
      return <em>Not provided</em>;
    return contributors
      .map((contributor: FormatContributorsProps) => `${contributor.fullName} (${contributor.email})`)
      .join(", ");
  };

  return (
    <Html lang="en">
      <Head>
        <title>Paper Uploaded Successfully</title>
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
        Your paper "{paper.title}" has been uploaded successfully.
      </Preview>

      <Section>
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Paper Upload Confirmation
        </Text>

        <Text>
          Your paper titled <strong>{paper.title}</strong> has been successfully
          uploaded to the Journal of Embedded and Digital System Design (JEDSD).
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
                {formatContact(
                  paper.pointOfContact &&
                    typeof paper.pointOfContact === "object" &&
                    "fullName" in paper.pointOfContact &&
                    "email" in paper.pointOfContact
                    ? (paper.pointOfContact as {
                        fullName: string;
                        email: string;
                      })
                    : null
                )}
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Contributors</td>
              <td style={tdStyle}>
                {formatContributors(
                  Array.isArray(paper.contributors)
                    ? (paper.contributors as unknown as FormatContributorsProps[])
                    : typeof paper.contributors === "string"
                    ? (() => {
                        try {
                          const parsed = JSON.parse(paper.contributors);
                          return Array.isArray(parsed) ? parsed : undefined;
                        } catch {
                          return undefined;
                        }
                      })()
                    : undefined
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={{ marginTop: "20px" }}>
          <strong>Download your submission:</strong>
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
          Our editorial team will review your submission and notify you of any
          updates.
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