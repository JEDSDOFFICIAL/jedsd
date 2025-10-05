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
  paperId: string;
  paperTitle: string;
  review: PaperReview,
  reviewerEmail: string;
  reviewerName: string;
  editorName?: string;
}

export default function ReviewSubmissionEmail({
  paperId,
  paperTitle,
  review,
  reviewerEmail,
  reviewerName,
  editorName = "Editor",
}: ReviewSubmissionEmailProps) {
  const getRecommendationColor = () => {
    switch (review.reviewerStatus) {
      case 'ACCEPTED_FOR_PUBLICATION': return '#28a745';
      case 'MINOR_REVISION': return '#ffc107';
      case 'MAJOR_REVISION': return '#fd7e14';
      case 'REJECTED_FOR_PUBLICATION': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getRecommendationText = () => {
    switch (review.reviewerStatus) {
      case 'ACCEPTED_FOR_PUBLICATION': return 'Accept';
      case 'MINOR_REVISION': return 'Minor Revision Required';
      case 'MAJOR_REVISION': return 'Major Revision Required';
      case 'REJECTED_FOR_PUBLICATION': return 'Reject';
      default: return 'Under Review';
    }
  };

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>JEDSD - Review Submitted</title>
        <Font
          fontFamily="Arial"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Review submitted for: {paperTitle}</Preview>
      
      <Container style={containerStyle}>
        <Section style={cardStyle}>
          <Heading as="h2" style={headingStyle}>
            Review Submitted
          </Heading>
          
          <Text style={greetingStyle}>
            Dear {editorName},
          </Text>
          
          <Text style={textStyle}>
            A review has been submitted by <strong>{reviewerName}</strong> for the following paper:
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
              Review Summary:
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
          
          <Section style={commentsBoxStyle}>
            <Heading as="h4" style={commentsHeadingStyle}>
              Reviewer Comments:
            </Heading>
            <Text style={commentsTextStyle}>
              {review.reviewText.length > 30 ? review.reviewText.substring(0, 30) + "..." : review.reviewText}
            </Text>
            {
              review.reviewText.length >30 &&(
                <Button style={{...primaryButtonStyle, padding: '10px 20px', fontSize: '14px', marginTop: '15px'}} href={`https://jedsd.com/dashboard`}>
                  Read Full Comments
                </Button>
              )
            }
          </Section>
          
          <Section style={actionBoxStyle}>
            <Text style={actionTextStyle}>
              <strong>Next Steps:</strong><br />
              Please review the feedback and make a decision on the paper. You can accept, request revisions, or reject the submission based on the reviewer's recommendations.
            </Text>
          </Section>
          
          <Section style={buttonSectionStyle}>

            <Button style={secondaryButtonStyle} href={`https://jedsd.com/dashboard`}>
              View Dashboard
            </Button>
          </Section>
          
          <Hr style={hrStyle} />
          
          <Text style={footerStyle}>
            This is an automated notification from JEDSD.<br />
            Please do not reply to this email.
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

const commentsBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #e9ecef',
};

const commentsHeadingStyle = {
  color: '#2c3e50',
  marginBottom: '10px',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const commentsTextStyle = {
  color: '#5d6d7e',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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
  margin: '0 10px 10px 0',
};

const secondaryButtonStyle = {
  backgroundColor: '#6c757d',
  color: 'white',
  padding: '14px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '16px',
  margin: '0 10px 10px 0',
};

const hrStyle = {
  margin: '30px 0',
  border: 'none',
  borderTop: '1px solid #e9ecef',
};

const footerStyle = {
  color: '#6c757d',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.5',
};
