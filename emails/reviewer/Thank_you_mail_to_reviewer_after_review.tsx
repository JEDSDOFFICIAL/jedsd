import { PaperReview } from '@prisma/client';
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
} from '@react-email/components';

interface ReviewSubmissionEmailProps {
  paperTitle: string;
  reviewerName: string;
  paperId: string;
  editorName: string;
  review: PaperReview;
}

export default function ReviewerThankYouEmail({
  paperTitle,
  reviewerName,
  paperId,
  editorName,
  review,
}: ReviewSubmissionEmailProps) {
  
  const getRecommendationText = () => {
    switch(review.reviewerStatus) {
      case 'ACCEPTED_FOR_PUBLICATION': return 'Accept';
      case 'REJECTED_FOR_PUBLICATION': return 'Reject';
      case 'MAJOR_REVISION': return 'Major Revision';
      case 'MINOR_REVISION': return 'Minor Revision';
      default: return 'Pending';
    }
  };

  const getRecommendationColor = () => {
    switch(review.reviewerStatus) {
      case 'ACCEPTED_FOR_PUBLICATION': return '#28a745';
      case 'REJECTED_FOR_PUBLICATION': return '#dc3545';
      case 'MAJOR_REVISION': return '#ffc107';
      case 'MINOR_REVISION': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Thank You for Your Review</title>
        <Font
          fontFamily="Arial"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Thank you for your valuable review, {reviewerName}</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Thank You for Your Review
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {reviewerName},
          </Text>
          
          <Text style={textStyle}>
            Thank you for taking the time to review the manuscript and provide your valuable feedback. Your expertise and insights are essential to maintaining the quality of our journal.
          </Text>
          
          <Section style={paperDetailsBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Paper Details:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Paper ID:</strong> {paperId}
            </Text>
            <Text style={detailItemStyle}>
              <strong>Title:</strong> {paperTitle}
            </Text>
          </Section>
          
          <Section style={reviewSummaryBoxStyle}>
            <Heading as="h3" style={subHeadingStyle}>
              Your Review Summary:
            </Heading>
            <Text style={detailItemStyle}>
              <strong>Score:</strong> {review.rating}/10
            </Text>
            <Section style={{
              ...recommendationBadgeStyle,
              backgroundColor: getRecommendationColor(),
            }}>
              <Text style={recommendationTextStyle}>
                <strong>Recommendation:</strong> {getRecommendationText()}
              </Text>
            </Section>
          </Section>
          
          <Section style={appreciationBoxStyle}>
            <Text style={appreciationTextStyle}>
              Your thorough evaluation and constructive feedback will help the authors improve their work and contribute to the advancement of research in this field. We greatly appreciate the time and effort you dedicated to this review.
            </Text>
          </Section>
          
          <Section style={actionBoxStyle}>
            <Text style={actionTextStyle}>
              <strong>What's Next:</strong><br />
              We will carefully consider your recommendations along with other reviews as we make our editorial decision. You will be notified once a final decision has been made on this manuscript.
            </Text>
          </Section>
          
          <Section style={buttonSectionStyle}>
            <Button style={primaryButtonStyle} href={`https://jedsd.com/dashboard`}>
              View Your Dashboard
            </Button>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            Thank you again for your contribution to JEDSD.<br />
            <br />
            Best regards,<br />
            {editorName}<br />
            Editor, JEDSD
          </Text>
          
          <Text style={disclaimerStyle}>
            This is an automated notification from JEDSD.
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

const containerStyle = {
  fontFamily: 'Arial, sans-serif',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#f8f9fa',
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const headingStyle = {
  color: '#2c3e50',
  marginBottom: '20px',
  fontSize: '26px',
  fontWeight: '600',
  textAlign: 'center' as const,
};

const greetingStyle = {
  color: '#34495e',
  lineHeight: '1.6',
  marginBottom: '20px',
  fontSize: '16px',
};

const textStyle = {
  color: '#5d6d7e',
  lineHeight: '1.6',
  marginBottom: '20px',
  fontSize: '16px',
};

const paperDetailsBoxStyle = {
  backgroundColor: '#e8f4f8',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #3498db',
};

const subHeadingStyle = {
  color: '#2c3e50',
  marginBottom: '15px',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 15px 0',
};

const detailItemStyle = {
  margin: '8px 0',
  color: '#34495e',
  fontSize: '14px',
  lineHeight: '1.5',
};

const reviewSummaryBoxStyle = {
  backgroundColor: '#f1f3f4',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #e9ecef',
};

const recommendationBadgeStyle = {
  padding: '10px 15px',
  borderRadius: '6px',
  margin: '10px 0',
  textAlign: 'center' as const,
};

const recommendationTextStyle = {
  margin: '0',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
};

const appreciationBoxStyle = {
  backgroundColor: '#fff3cd',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #ffc107',
};

const appreciationTextStyle = {
  margin: '0',
  color: '#856404',
  fontSize: '14px',
  lineHeight: '1.6',
};

const actionBoxStyle = {
  backgroundColor: '#e8f5e8',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #28a745',
};

const actionTextStyle = {
  margin: '0',
  color: '#155724',
  fontSize: '14px',
  lineHeight: '1.6',
};

const buttonSectionStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const primaryButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '14px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '16px',
};

const hrStyle = {
  margin: '30px 0',
  border: 'none',
  borderTop: '1px solid #e9ecef',
};

const footerStyle = {
  color: '#34495e',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '0 0 15px 0',
  lineHeight: '1.6',
};

const disclaimerStyle = {
  color: '#6c757d',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.5',
};