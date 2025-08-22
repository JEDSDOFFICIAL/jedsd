import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Section,
  Text,
  Button,
  Container,
  Hr,
  Img,
} from '@react-email/components';

interface ReviewerAssignmentEmailProps {
  reviewerName: string;
  paperTitle: string;
  paperAbstract: string;
  authorName: string;
  submissionDate: string;
  reviewDeadline: string;
  reviewUrl: string;
  dashboardUrl: string;
}

export default function ReviewerAssignmentEmail({
  reviewerName,
  paperTitle,
  paperAbstract,
  authorName,
  submissionDate,
  reviewDeadline,
  reviewUrl,
  dashboardUrl,
}: ReviewerAssignmentEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - New Paper Assignment for Review</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>🔍 New paper assigned: {paperTitle}</Preview>
      
      <Container style={containerStyle}>
        {/* Header Section */}
        <Section style={headerStyle}>
          <div style={logoContainerStyle}>
            <Text style={logoStyle}>JEDSD</Text>
            <Text style={logoSubtitleStyle}>Journal of Engineering Design & Sustainable Development</Text>
          </div>
        </Section>

        {/* Main Content Card */}
        <Section style={mainCardStyle}>
          {/* Icon and Title */}
          <div style={iconSectionStyle}>
            <div style={iconStyle}>🔍</div>
            <Heading as="h1" style={titleStyle}>
              New Paper Assignment
            </Heading>
            <Text style={subtitleStyle}>
              You have been assigned a new paper for review
            </Text>
          </div>

          {/* Greeting */}
          <Text style={greetingStyle}>
            Dear Dr. {reviewerName},
          </Text>
          
          <Text style={bodyTextStyle}>
            We are pleased to invite you to review a manuscript that has been submitted to JEDSD. 
            Your expertise makes you an ideal reviewer for this paper.
          </Text>

          {/* Paper Details Card */}
          <Section style={paperDetailsCardStyle}>
            <div style={paperHeaderStyle}>
              <Text style={sectionTitleStyle}>📄 Paper Details</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>Title:</Text>
              <Text style={valueStyle}>{paperTitle}</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>Author:</Text>
              <Text style={valueStyle}>{authorName}</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>Submitted:</Text>
              <Text style={valueStyle}>{submissionDate}</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>Review Deadline:</Text>
              <Text style={deadlineValueStyle}>{reviewDeadline}</Text>
            </div>
          </Section>

          {/* Abstract Section */}
          <Section style={abstractSectionStyle}>
            <Text style={sectionTitleStyle}>📋 Abstract</Text>
            <div style={abstractBoxStyle}>
              <Text style={abstractTextStyle}>
                {paperAbstract}
              </Text>
            </div>
          </Section>

          {/* Deadline Alert */}
          <Section style={deadlineAlertStyle}>
            <div style={alertIconStyle}>⏰</div>
            <div>
              <Text style={alertTitleStyle}>Review Deadline</Text>
              <Text style={alertTextStyle}>
                Please submit your review by <strong>{reviewDeadline}</strong>
              </Text>
            </div>
          </Section>

          {/* Action Buttons */}
          <Section style={buttonSectionStyle}>
            <Button style={primaryButtonStyle} href={reviewUrl}>
              🚀 Start Review
            </Button>
            <Button style={secondaryButtonStyle} href={dashboardUrl}>
              📊 View Dashboard
            </Button>
          </Section>

          {/* Review Guidelines */}
          <Section style={guidelinesStyle}>
            <Text style={guidelinesTitleStyle}>📋 Review Guidelines</Text>
            <div style={guidelinesContentStyle}>
              <div style={guidelineItemStyle}>
                <Text style={guidelineTextStyle}>• Evaluate methodology, results, and conclusions</Text>
              </div>
              <div style={guidelineItemStyle}>
                <Text style={guidelineTextStyle}>• Rate based on originality, quality, and significance</Text>
              </div>
              <div style={guidelineItemStyle}>
                <Text style={guidelineTextStyle}>• Provide constructive feedback for improvements</Text>
              </div>
              <div style={guidelineItemStyle}>
                <Text style={guidelineTextStyle}>• Maintain strict confidentiality</Text>
              </div>
            </div>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footerStyle}>
          <Text style={footerTextStyle}>
            Thank you for your valuable contribution to the peer review process.
          </Text>
          <Text style={footerTextStyle}>
            <strong>Journal of Engineering Design & Sustainable Development</strong>
          </Text>
          <Text style={footerLegalStyle}>
            This is an automated message. Please do not reply to this email.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

// Modern Email Styles with Beautiful Design
const containerStyle = {
  maxWidth: '640px',
  margin: '0 auto',
  backgroundColor: '#f8fafc',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '20px',
};

const headerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px 16px 0 0',
  padding: '40px 40px 30px 40px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const logoContainerStyle = {
  textAlign: 'center' as const,
};

const logoStyle = {
  fontSize: '36px',
  fontWeight: '800',
  color: '#ffffff',
  margin: '0 0 8px 0',
  letterSpacing: '2px',
};

const logoSubtitleStyle = {
  fontSize: '14px',
  color: '#e2e8f0',
  margin: '0',
  fontWeight: '400',
};

const mainCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 16px 16px',
  padding: '40px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const iconSectionStyle = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const iconStyle = {
  fontSize: '48px',
  marginBottom: '16px',
  display: 'inline-block',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '50%',
  width: '80px',
  height: '80px',
  lineHeight: '80px',
  textAlign: 'center' as const,
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#64748b',
  margin: '0 0 32px 0',
  fontWeight: '400',
};

const greetingStyle = {
  fontSize: '18px',
  color: '#334155',
  margin: '0 0 24px 0',
  fontWeight: '500',
};

const bodyTextStyle = {
  fontSize: '16px',
  lineHeight: '1.7',
  color: '#475569',
  margin: '0 0 32px 0',
};

const paperDetailsCardStyle = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
};

const paperHeaderStyle = {
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '2px solid #e2e8f0',
};

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0',
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '12px',
  gap: '12px',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  minWidth: '80px',
  margin: '0',
};

const valueStyle = {
  fontSize: '14px',
  color: '#334155',
  margin: '0',
  fontWeight: '500',
  flex: '1',
};

const deadlineValueStyle = {
  fontSize: '14px',
  color: '#dc2626',
  margin: '0',
  fontWeight: '600',
  flex: '1',
};

const abstractSectionStyle = {
  marginBottom: '24px',
};

const abstractBoxStyle = {
  backgroundColor: '#fefefe',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '12px',
};

const abstractTextStyle = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#475569',
  margin: '0',
  fontStyle: 'italic',
};

const deadlineAlertStyle = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '32px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const alertIconStyle = {
  fontSize: '24px',
};

const alertTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 4px 0',
};

const alertTextStyle = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  gap: '12px',
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
};

const primaryButtonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  margin: '4px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
};

const secondaryButtonStyle = {
  backgroundColor: '#f8fafc',
  color: '#334155',
  padding: '16px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  margin: '4px',
  border: '1px solid #e2e8f0',
  transition: 'all 0.2s ease',
};

const guidelinesStyle = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
};

const guidelinesTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#166534',
  margin: '0 0 16px 0',
};

const guidelinesContentStyle = {
  marginLeft: '0',
};

const guidelineItemStyle = {
  marginBottom: '8px',
};

const guidelineTextStyle = {
  fontSize: '14px',
  color: '#166534',
  margin: '0',
  lineHeight: '1.5',
};

const footerStyle = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginTop: '24px',
};

const footerTextStyle = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};

const footerLegalStyle = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '16px 0 0 0',
};
