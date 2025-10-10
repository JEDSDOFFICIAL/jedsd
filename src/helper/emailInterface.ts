import { PaperReview, ResearchPaper, ReviewerStatus, User } from "@prisma/client";

export interface sendVerificationMailProps {
  otp: string;
  name: string;
  email: string;
}

export interface sendPaperUploadMailProps {
    paper: ResearchPaper,
    emails:string[]
}


export interface sendReviewerAllocationMailProps {
    paper: ResearchPaper,
    revieweremail:string,
    reviewerName:string
}


export interface sendReviewerAcceptanceMailProps {
  paperTitle: string,
  reviewerName: string,
  acceptanceStatus: ReviewerStatus,
}

export interface sendReviewedMailToEditorProps {
  paperTitle: string,
  paperId: string,
  review:PaperReview,
  reviewerEmail:string,
  reviewerName:string
}