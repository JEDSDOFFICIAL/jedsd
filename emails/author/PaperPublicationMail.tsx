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

interface PaperPublicationEmailProps {
  authorName: string;
  paperTitle: string;
  publicationDate: string;
  volume?: string;
  issue?: string;
  pageNumbers?: string;
  doi?: string;
  citationFormat: string;
  paperUrl: string;
  journalUrl: string;
  dashboardUrl: string;
}

export default function PaperPublicationEmail({
  authorName,
  paperTitle,
  publicationDate,
  volume,
  issue,
  pageNumbers,
  doi,
  citationFormat,
  paperUrl,
  journalUrl,
  dashboardUrl,
}: PaperPublicationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>🎉 Congratulations! Your Paper is Published - JEDSD</title>
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
      <Preview>🎉 Your paper "{paperTitle}" is now published!</Preview>
      
      <Container style={containerStyle}>
        {/* Celebration Header */}
        <Section style={celebrationHeaderStyle}>
          <div style={confettiStyle}>🎉 ✨ 🎊 🌟 🎉 ✨ 🎊 🌟</div>
          <div style={logoContainerStyle}>
            <Text style={logoStyle}>JEDSD</Text>
            <Text style={logoSubtitleStyle}>Journal of Engineering Design & Sustainable Development</Text>
          </div>
          <div style={celebrationTitleStyle}>
            <Text style={celebrationMainStyle}>Congratulations!</Text>
            <Text style={celebrationSubStyle}>Your Paper is Now Published</Text>
          </div>
        </Section>

        {/* Main Content Card */}
        <Section style={mainCardStyle}>
          {/* Achievement Badge */}
          <div style={achievementSectionStyle}>
            <div style={achievementBadgeStyle}>🏆</div>
            <Text style={achievementTextStyle}>Publication Achievement Unlocked!</Text>
          </div>

          {/* Personal Greeting */}
          <Text style={greetingStyle}>
            Dear {authorName},
          </Text>
          
          <Text style={bodyTextStyle}>
            We are absolutely thrilled to inform you that your manuscript has been successfully published 
            in the Journal of Engineering Design and Sustainable Development! This is a significant 
            achievement and a valuable contribution to the scientific community.
          </Text>

          {/* Publication Details Card */}
          <Section style={publicationDetailsStyle}>
            <div style={detailsHeaderStyle}>
              <Text style={sectionTitleStyle}>📖 Publication Details</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>📄 Title:</Text>
              <Text style={titleValueStyle}>{paperTitle}</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>👨‍🎓 Author:</Text>
              <Text style={valueStyle}>{authorName}</Text>
            </div>
            
            <div style={detailRowStyle}>
              <Text style={labelStyle}>📅 Published:</Text>
              <Text style={dateValueStyle}>{publicationDate}</Text>
            </div>
            
            {volume && (
              <div style={detailRowStyle}>
                <Text style={labelStyle}>📚 Volume:</Text>
                <Text style={valueStyle}>{volume}</Text>
              </div>
            )}
            
            {issue && (
              <div style={detailRowStyle}>
                <Text style={labelStyle}>📑 Issue:</Text>
                <Text style={valueStyle}>{issue}</Text>
              </div>
            )}
            
            {pageNumbers && (
              <div style={detailRowStyle}>
                <Text style={labelStyle}>📄 Pages:</Text>
                <Text style={valueStyle}>{pageNumbers}</Text>
              </div>
            )}
            
            {doi && (
              <div style={detailRowStyle}>
                <Text style={labelStyle}>🔗 DOI:</Text>
                <Text style={doiValueStyle}>{doi}</Text>
              </div>
            )}
          </Section>

          {/* Citation Card */}
          <Section style={citationCardStyle}>
            <Text style={citationTitleStyle}>📋 Citation Format</Text>
            <div style={citationBoxStyle}>
              <Text style={citationTextStyle}>
                {citationFormat}
              </Text>
            </div>
            <Text style={citationHelpStyle}>
              Copy this citation for your academic references
            </Text>
          </Section>

          {/* Impact Statement */}
          <Section style={impactSectionStyle}>
            <div style={impactIconStyle}>🌍</div>
            <div>
              <Text style={impactTitleStyle}>Your Research Impact</Text>
              <Text style={impactTextStyle}>
                Your work is now part of the permanent scientific record and will be accessible 
                to researchers worldwide. This publication represents a significant milestone in 
                advancing knowledge in engineering design and sustainable development.
              </Text>
            </div>
          </Section>

          {/* Action Buttons */}
          <Section style={buttonSectionStyle}>
            <Button style={primaryButtonStyle} href={paperUrl}>
              🎯 View Published Paper
            </Button>
            <Button style={secondaryButtonStyle} href={journalUrl}>
              📰 Browse Journal
            </Button>
            <Button style={tertiaryButtonStyle} href={dashboardUrl}>
              📊 My Dashboard
            </Button>
          </Section>

          {/* Sharing Tips */}
          <Section style={sharingTipsStyle}>
            <Text style={sharingTitleStyle}>📢 Share Your Success</Text>
            <div style={sharingGridStyle}>
              <div style={sharingItemStyle}>
                <Text style={sharingItemTitleStyle}>🎓 Academic Profile</Text>
                <Text style={sharingItemTextStyle}>Add to your CV and research portfolio</Text>
              </div>
              <div style={sharingItemStyle}>
                <Text style={sharingItemTitleStyle}>🌐 Social Networks</Text>
                <Text style={sharingItemTextStyle}>Share on LinkedIn, ResearchGate, Twitter</Text>
              </div>
              <div style={sharingItemStyle}>
                <Text style={sharingItemTitleStyle}>🏢 Institution</Text>
                <Text style={sharingItemTextStyle}>Inform colleagues and department</Text>
              </div>
              <div style={sharingItemStyle}>
                <Text style={sharingItemTitleStyle}>💰 Grants & Funding</Text>
                <Text style={sharingItemTextStyle}>Include in applications and reports</Text>
              </div>
            </div>
          </Section>

          {/* Next Steps */}
          <Section style={nextStepsStyle}>
            <Text style={nextStepsTitleStyle}>🚀 What's Next</Text>
            <div style={nextStepsContentStyle}>
              <div style={stepItemStyle}>
                <div style={stepIconStyle}>📊</div>
                <Text style={stepTextStyle}>Your paper will be indexed in major databases</Text>
              </div>
              <div style={stepItemStyle}>
                <div style={stepIconStyle}>📈</div>
                <Text style={stepTextStyle}>You'll receive citation alerts as your work gains recognition</Text>
              </div>
              <div style={stepItemStyle}>
                <div style={stepIconStyle}>🔬</div>
                <Text style={stepTextStyle}>Researchers can now cite and build upon your work</Text>
              </div>
              <div style={stepItemStyle}>
                <div style={stepIconStyle}>📝</div>
                <Text style={stepTextStyle}>Consider submitting your future research to JEDSD</Text>
              </div>
            </div>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footerStyle}>
          <Text style={footerTitleStyle}>
            Thank You for Choosing JEDSD!
          </Text>
          <Text style={footerTextStyle}>
            We appreciate your valuable contribution to advancing engineering design 
            and sustainable development research. For any questions, contact us at editorial@jedsd.com.
          </Text>
          <Text style={footerLegalStyle}>
            Journal of Engineering Design & Sustainable Development<br />
            editorial@jedsd.com<br />
            This is an automated message. Please do not reply to this email.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

// Beautiful Celebration Email Styles
const containerStyle = {
  maxWidth: '640px',
  margin: '0 auto',
  backgroundColor: '#f8fafc',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '20px',
};

const celebrationHeaderStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '20px 20px 0 0',
  padding: '40px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative' as const,
  overflow: 'hidden',
};

const confettiStyle = {
  fontSize: '20px',
  letterSpacing: '8px',
  marginBottom: '20px',
  animation: 'bounce 2s infinite',
  opacity: '0.8',
};

const logoContainerStyle = {
  marginBottom: '24px',
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

const celebrationTitleStyle = {
  textAlign: 'center' as const,
};

const celebrationMainStyle = {
  fontSize: '42px',
  fontWeight: '800',
  color: '#ffffff',
  margin: '0 0 8px 0',
  textShadow: '0 3px 6px rgba(0,0,0,0.2)',
  letterSpacing: '1px',
};

const celebrationSubStyle = {
  fontSize: '20px',
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

const achievementSectionStyle = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  padding: '24px',
  backgroundColor: '#fef3c7',
  borderRadius: '16px',
  border: '2px solid #fbbf24',
};

const achievementBadgeStyle = {
  fontSize: '64px',
  marginBottom: '12px',
  display: 'inline-block',
  animation: 'pulse 2s infinite',
};

const achievementTextStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0',
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

const publicationDetailsStyle = {
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
  minWidth: '120px',
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

const dateValueStyle = {
  fontSize: '15px',
  color: '#059669',
  margin: '0',
  fontWeight: '600',
  flex: '1',
};

const doiValueStyle = {
  fontSize: '13px',
  color: '#7c3aed',
  margin: '0',
  fontWeight: '500',
  flex: '1',
  fontFamily: 'monospace',
};

const citationCardStyle = {
  backgroundColor: '#f8fafc',
  border: '2px dashed #64748b',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '28px',
  textAlign: 'center' as const,
};

const citationTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#334155',
  margin: '0 0 16px 0',
};

const citationBoxStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
};

const citationTextStyle = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#1e293b',
  margin: '0',
  fontFamily: 'monospace',
  fontStyle: 'italic',
};

const citationHelpStyle = {
  fontSize: '12px',
  color: '#64748b',
  margin: '8px 0 0 0',
  fontStyle: 'italic',
};

const impactSectionStyle = {
  backgroundColor: '#ecfdf5',
  border: '2px solid #10b981',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '32px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
};

const impactIconStyle = {
  fontSize: '32px',
  flexShrink: '0',
};

const impactTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const impactTextStyle = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#065f46',
  margin: '0',
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
  backgroundColor: '#059669',
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

const tertiaryButtonStyle = {
  backgroundColor: '#f1f5f9',
  color: '#334155',
  padding: '16px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  margin: '4px',
  border: '2px solid #e2e8f0',
  minWidth: '200px',
  justifyContent: 'center',
};

const sharingTipsStyle = {
  backgroundColor: '#fef7ff',
  border: '2px solid #c084fc',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '28px',
};

const sharingTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#7c2d92',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const sharingGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const sharingItemStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid #e5b4f3',
};

const sharingItemTitleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#7c2d92',
  margin: '0 0 4px 0',
};

const sharingItemTextStyle = {
  fontSize: '12px',
  color: '#a21caf',
  margin: '0',
  lineHeight: '1.4',
};

const nextStepsStyle = {
  backgroundColor: '#eff6ff',
  border: '2px solid #3b82f6',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '32px',
};

const nextStepsTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1e40af',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const nextStepsContentStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
};

const stepItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '12px',
  border: '1px solid #bfdbfe',
};

const stepIconStyle = {
  fontSize: '20px',
  flexShrink: '0',
};

const stepTextStyle = {
  fontSize: '14px',
  color: '#1e40af',
  margin: '0',
  lineHeight: '1.5',
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
