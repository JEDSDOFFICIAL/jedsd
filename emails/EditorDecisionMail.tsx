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

interface EditorDecisionEmailProps {
  pocName: string;
  editorName: string;
  paperTitle: string;
  authorName: string;
  decision: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  editorComments: string;
  reviewerComments?: string;
  revisionDeadline?: string;
  paperUrl: string;
  dashboardUrl: string;
}

export default function EditorDecisionEmail({
  pocName,
  editorName,
  paperTitle,
  authorName,
  decision,
  editorComments,
  reviewerComments,
  revisionDeadline,
  paperUrl,
  dashboardUrl,
}: EditorDecisionEmailProps) {
  const getDecisionEmoji = () => {
    switch (decision) {
      case 'ACCEPT': return '🎉';
      case 'MINOR_REVISION': return '📝';
      case 'MAJOR_REVISION': return '🔄';
      case 'REJECT': return '💔';
      default: return '📄';
    }
  };

  const getDecisionGradient = () => {
    switch (decision) {
      case 'ACCEPT': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'MINOR_REVISION': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'MAJOR_REVISION': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'REJECT': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      default: return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  };

  const getDecisionColor = () => {
    switch (decision) {
      case 'ACCEPT': return '#10b981';
      case 'MINOR_REVISION': return '#f59e0b';
      case 'MAJOR_REVISION': return '#ef4444';
      case 'REJECT': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getDecisionText = () => {
    switch (decision) {
      case 'ACCEPT': return 'Accepted for Publication';
      case 'MINOR_REVISION': return 'Minor Revision Required';
      case 'MAJOR_REVISION': return 'Major Revision Required';
      case 'REJECT': return 'Rejected';
      default: return 'Under Review';
    }
  };

  const getDecisionMessage = () => {
    switch (decision) {
      case 'ACCEPT':
        return 'Congratulations! Your paper has been accepted for publication. Our editorial team will now proceed with the publication process.';
      case 'MINOR_REVISION':
        return 'Your paper requires minor revisions before it can be accepted for publication. Please address the comments below and resubmit your revised manuscript.';
      case 'MAJOR_REVISION':
        return 'Your paper requires major revisions before it can be reconsidered for publication. Please carefully address all the reviewer and editor comments and resubmit your revised manuscript.';
      case 'REJECT':
        return 'After careful review, we regret to inform you that your paper has not been accepted for publication in its current form.';
      default:
        return 'Your paper is currently under review.';
    }
  };

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Editor Decision</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>📋 Editorial Decision: {getDecisionText()} - {paperTitle}</Preview>
      
      <Container style={containerStyle}>
        {/* Modern Header with Decision Status */}
        <Section style={{
          ...decisionHeaderStyle,
          background: getDecisionGradient(),
        }}>
          <Section style={logoContainerStyle}>
            <Text style={logoStyle}>JEDSD</Text>
            <Text style={logoSubtitleStyle}>Journal of Engineering Development & Scientific Discovery</Text>
          </Section>
          
          <Section style={decisionBannerStyle}>
            <Text style={decisionEmojiStyle}>{getDecisionEmoji()}</Text>
            <Heading as="h1" style={decisionTitleStyle}>
              Editorial Decision
            </Heading>
            <Text style={decisionSubtitleStyle}>
              Review completed for your manuscript
            </Text>
          </Section>
        </Section>

        {/* Main Content Card */}
        <Section style={mainCardStyle}>
          <Text style={greetingStyle}>
            Dear <strong>{pocName}</strong>,
          </Text>
          
          <Text style={bodyTextStyle}>
            We have completed the review process for your manuscript. The editorial team has carefully 
            evaluated your submission based on our journal's standards for scientific rigor, originality, 
            and contribution to the field.
          </Text>

          {/* Paper Details */}
          <Section style={paperDetailsStyle}>
            <Section style={detailsHeaderStyle}>
              <Text style={sectionTitleStyle}>📄 Manuscript Details</Text>
            </Section>
            
            <Section style={detailRowStyle}>
              <Text style={labelStyle}>Title:</Text>
              <Text style={titleValueStyle}>{paperTitle}</Text>
            </Section>
            
            <Section style={detailRowStyle}>
              <Text style={labelStyle}>Author:</Text>
              <Text style={valueStyle}>{authorName}</Text>
            </Section>
            
            <Section style={detailRowStyle}>
              <Text style={labelStyle}>Editor:</Text>
              <Text style={valueStyle}>{editorName}</Text>
            </Section>
          </Section>

          {/* Decision Card */}
          <Section style={{
            ...decisionCardStyle,
            borderColor: getDecisionColor(),
          }}>
            <Section style={{
              ...decisionBadgeContainerStyle,
              backgroundColor: getDecisionColor(),
            }}>
              <Text style={decisionBadgeEmojiStyle}>{getDecisionEmoji()}</Text>
              <Text style={decisionBadgeTextStyle}>
                {getDecisionText()}
              </Text>
            </Section>
            
            <Text style={decisionMessageStyle}>
              {getDecisionMessage()}
            </Text>
          </Section>

          {/* Revision Deadline (if applicable) */}
          {revisionDeadline && (decision === 'MINOR_REVISION' || decision === 'MAJOR_REVISION') && (
            <Section style={deadlineCardStyle}>
              <Section style={deadlineIconStyle}>⏰</Section>
              <Section style={deadlineContentStyle}>
                <Text style={deadlineTitleStyle}>Revision Deadline</Text>
                <Text style={deadlineDateStyle}>{revisionDeadline}</Text>
                <Text style={deadlineNoteStyle}>
                  Please submit your revised manuscript before this date
                </Text>
              </Section>
            </Section>
          )}

          {/* Editor Comments */}
          <Section style={commentsCardStyle}>
            <Section style={commentsHeaderStyle}>
              <Text style={commentsIconStyle}>👨‍💼</Text>
              <Text style={commentsTitleStyle}>Editor's Comments</Text>
            </Section>
            <Text style={commentsContentStyle}>
              {editorComments}
            </Text>
          </Section>

          {/* Reviewer Comments (if available) */}
          {reviewerComments && (
            <Section style={reviewerCommentsCardStyle}>
              <Section style={commentsHeaderStyle}>
                <Text style={commentsIconStyle}>👥</Text>
                <Text style={commentsTitleStyle}>Reviewer's Comments</Text>
              </Section>
              <Text style={commentsContentStyle}>
                {reviewerComments}
              </Text>
            </Section>
          )}

          {/* Next Steps for Acceptance */}
          {decision === 'ACCEPT' && (
            <Section style={successStepsStyle}>
              <Section style={stepsHeaderStyle}>
                <Text style={stepsIconStyle}>🎯</Text>
                <Text style={stepsTitleStyle}>Next Steps - Publication Process</Text>
              </Section>
              <Section style={stepsListStyle}>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>1</Text>
                  <Text style={stepTextStyle}>Production team will format your manuscript</Text>
                </Section>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>2</Text>
                  <Text style={stepTextStyle}>You'll receive proofs for final review</Text>
                </Section>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>3</Text>
                  <Text style={stepTextStyle}>Publication within 2-4 weeks</Text>
                </Section>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>4</Text>
                  <Text style={stepTextStyle}>Notification when your paper goes live</Text>
                </Section>
              </Section>
            </Section>
          )}

          {/* Revision Guidelines */}
          {(decision === 'MINOR_REVISION' || decision === 'MAJOR_REVISION') && (
            <Section style={revisionGuideStyle}>
              <Section style={stepsHeaderStyle}>
                <Text style={stepsIconStyle}>📋</Text>
                <Text style={stepsTitleStyle}>Revision Guidelines</Text>
              </Section>
              <Section style={stepsListStyle}>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>1</Text>
                  <Text style={stepTextStyle}>Address all reviewer and editor comments</Text>
                </Section>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>2</Text>
                  <Text style={stepTextStyle}>Provide detailed response letter</Text>
                </Section>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>3</Text>
                  <Text style={stepTextStyle}>Highlight changes in revised manuscript</Text>
                </Section>
                <Section style={stepItemStyle}>
                  <Text style={stepNumberStyle}>4</Text>
                  <Text style={stepTextStyle}>Submit within the specified deadline</Text>
                </Section>
              </Section>
            </Section>
          )}

          {/* Action Buttons */}
          <Section style={buttonSectionStyle}>
            <Button style={primaryButtonStyle} href={paperUrl}>
              📄 View Paper Details
            </Button>
            <Button style={secondaryButtonStyle} href={dashboardUrl}>
              🏠 Go to Dashboard
            </Button>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footerStyle}>
          <Text style={footerTitleStyle}>
            Thank you for choosing JEDSD
          </Text>
          <Text style={footerTextStyle}>
            We appreciate your contribution to advancing scientific knowledge through research publication.
            Our editorial team is committed to maintaining the highest standards of academic excellence.
            For any questions, contact us at editorial@jedsd.com.
          </Text>
          <Text style={footerLegalStyle}>
            This is an automated message from the JEDSD Editorial System.<br />
            Please do not reply directly to this email.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

// Beautiful Modern Editor Decision Email Styles
const containerStyle = {
  maxWidth: '640px',
  margin: '0 auto',
  backgroundColor: '#f8fafc',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '20px',
};

const decisionHeaderStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '20px 20px 0 0',
  padding: '40px',
  textAlign: 'center' as const,
  position: 'relative' as const,
  overflow: 'hidden',
};

const logoContainerStyle = {
  marginBottom: '32px',
};

const logoStyle = {
  fontSize: '36px',
  fontWeight: '800',
  color: '#ffffff',
  margin: '0 0 8px 0',
  letterSpacing: '3px',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const logoSubtitleStyle = {
  fontSize: '13px',
  color: '#e2e8f0',
  margin: '0 0 24px 0',
  fontWeight: '400',
  opacity: '0.9',
};

const decisionBannerStyle = {
  textAlign: 'center' as const,
};

const decisionEmojiStyle = {
  fontSize: '48px',
  marginBottom: '16px',
  display: 'block',
  animation: 'bounce 2s infinite',
};

const decisionTitleStyle = {
  fontSize: '36px',
  fontWeight: '800',
  color: '#ffffff',
  margin: '0 0 8px 0',
  textShadow: '0 3px 6px rgba(0,0,0,0.2)',
  letterSpacing: '1px',
};

const decisionSubtitleStyle = {
  fontSize: '18px',
  color: '#f1f5f9',
  margin: '0',
  fontWeight: '500',
};

const mainCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 20px 20px',
  padding: '40px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const greetingStyle = {
  fontSize: '20px',
  color: '#1e293b',
  margin: '0 0 24px 0',
  fontWeight: '600',
};

const bodyTextStyle = {
  fontSize: '16px',
  lineHeight: '1.8',
  color: '#475569',
  margin: '0 0 32px 0',
};

const paperDetailsStyle = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '28px',
};

const detailsHeaderStyle = {
  marginBottom: '24px',
  textAlign: 'center' as const,
  paddingBottom: '16px',
  borderBottom: '2px solid #0ea5e9',
};

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0c4a6e',
  margin: '0',
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '8px 0',
  borderBottom: '1px solid #e0f2fe',
};

const labelStyle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#0369a1',
  minWidth: '80px',
  margin: '0',
};

const valueStyle = {
  fontSize: '15px',
  color: '#1e293b',
  margin: '0',
  fontWeight: '500',
  flex: '1',
};

const titleValueStyle = {
  fontSize: '15px',
  color: '#1e293b',
  margin: '0',
  fontWeight: '600',
  flex: '1',
};

const decisionCardStyle = {
  backgroundColor: '#ffffff',
  border: '3px solid',
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '32px',
  textAlign: 'center' as const,
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
};

const decisionBadgeContainerStyle = {
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '20px',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
};

const decisionBadgeEmojiStyle = {
  fontSize: '28px',
  margin: '0',
};

const decisionBadgeTextStyle = {
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  color: '#ffffff',
};

const decisionMessageStyle = {
  fontSize: '16px',
  lineHeight: '1.7',
  color: '#1e293b',
  margin: '0',
  fontWeight: '500',
};

const deadlineCardStyle = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '28px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const deadlineIconStyle = {
  fontSize: '32px',
  flexShrink: '0',
};

const deadlineContentStyle = {
  flex: '1',
};

const deadlineTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const deadlineDateStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#d97706',
  margin: '0 0 4px 0',
};

const deadlineNoteStyle = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  fontStyle: 'italic',
};

const commentsCardStyle = {
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '24px',
};

const reviewerCommentsCardStyle = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '24px',
};

const commentsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '2px solid #e2e8f0',
};

const commentsIconStyle = {
  fontSize: '24px',
};

const commentsTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0',
};

const commentsContentStyle = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#475569',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const successStepsStyle = {
  backgroundColor: '#ecfdf5',
  border: '2px solid #10b981',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '32px',
};

const revisionGuideStyle = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '32px',
};

const stepsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
  textAlign: 'center' as const,
  justifyContent: 'center',
};

const stepsIconStyle = {
  fontSize: '28px',
};

const stepsTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0',
};

const stepsListStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
};

const stepItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid #e2e8f0',
};

const stepNumberStyle = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#ffffff',
  backgroundColor: '#3b82f6',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0',
  flexShrink: '0',
};

const stepTextStyle = {
  fontSize: '15px',
  color: '#1e293b',
  margin: '0',
  lineHeight: '1.5',
  fontWeight: '500',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  alignItems: 'center',
};

const primaryButtonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  margin: '4px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  minWidth: '200px',
  justifyContent: 'center',
};

const secondaryButtonStyle = {
  backgroundColor: '#6b7280',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  margin: '4px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  minWidth: '200px',
  justifyContent: 'center',
};

const footerStyle = {
  backgroundColor: '#1e293b',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center' as const,
  marginTop: '24px',
};

const footerTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#f1f5f9',
  margin: '0 0 12px 0',
};

const footerTextStyle = {
  fontSize: '14px',
  color: '#cbd5e1',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const footerLegalStyle = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
  lineHeight: '1.5',
};
