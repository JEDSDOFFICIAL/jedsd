import {
  LayoutDashboard,
  Home,
  Upload,
  FileText,
  Users,
  UserCog,
  FileSignature,
  UserCheck,
  Bell,
  Settings,
  HelpCircle,
  PartyPopper,
  CheckCheck,
  Award,
  BookOpenText,
  CreditCard,

  GitCompare,
  Copyright,
  ShieldCheck,
  ClipboardCheck,
  FileType,
} from "lucide-react";




// Full menu structure (with role-based access where needed)
export const DashboardItems = [
  // MAIN (shared by all)
  {
    title: "Main",
    url: "#",
    icon: LayoutDashboard,
    access: ["AUTHOR", "REVIEWER", "EDITOR", "ADMIN"],
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Upload Manuscript", url: "/dashboard/author/upload", icon: Upload, access: ["AUTHOR"] },
      { title: "Allocated Papers", url: "/dashboard/reviewer/allocated", icon: FileText, access: ["REVIEWER"] },
      { title: "Write Reviews", url: "/dashboard/reviewer/write", icon: FileSignature ,access: ["REVIEWER"]},
      { title: "New Papers", url: "/dashboard/editor/new-papers", icon: FileText, access: ["EDITOR"] },
      { title: "Allocated Papers", url: "/dashboard/editor/allocated-papers", icon: CheckCheck, access: ["EDITOR"] },
      { title: "Final Decision", url: "/dashboard/editor/final-decision", icon: Award, access: ["EDITOR"] },
      { title: "Revisions Inbox", url: "/dashboard/editor/revisions", icon: FileSignature, access: ["EDITOR"] },
      { title: "Reviewer Management", url: "/dashboard/editor/reviewers", icon: Users, access: ["EDITOR"] },
      { title: "Read Reviews", url: "/dashboard/editor/reviews", icon: FileSignature, access: ["EDITOR"] },
     
    ],
  },
{
  title: "Guidelines",
  url: "#",
  icon: BookOpenText,
  access: ["AUTHOR"],
  items: [
    {
      title: "Author Guidelines",
      url: "/dashboard/author/guideline/author",
      icon: BookOpenText,
    },
    {
      title: "Formatting & Templates",
      url: "/dashboard/author/guideline/templates",
      icon: FileType,
    },
    {
      title: "Submission Requirements",
      url: "/dashboard/author/guideline/submission",
      icon: ClipboardCheck,
    },
    {
      title: "Publication Ethics",
      url: "/dashboard/author/guideline/ethical",
      icon: ShieldCheck,
    },
  
    {
      title: "Peer Review Process",
      url: "/dashboard/author/guideline/peer-review",
      icon: Users,
    },
  ],
},
  {
    title: "Profile & Settings",
    url: "#",
    icon: UserCog,
    access: ["AUTHOR", "REVIEWER", "EDITOR", "ADMIN"],
    items: [
      { title: "Profile Setup", url: "/dashboard/profile", icon: UserCog },
    ],
  },
  {
    title: "Admin Panel",
    url: "#",
    icon: Users,
    access: ["ADMIN", "EDITOR"],
    items: [
      { title: "User Management", url: "/dashboard/admin/users", icon: Users },
      { title: "Role Management", url: "/dashboard/admin/roles", icon: UserCog },
      { title: "Paper Management", url: "/dashboard/admin/papers", icon: FileText },
      { title: "System Settings", url: "/dashboard/admin/settings", icon: Settings },
    ],
  },

  // PROFILE & SETTINGS (shared)
  

 
];


export type AuthorOrContact = {
  fullName: string;
  affiliation?: string;
  email: string;
  contactNumber?: string;
};

export interface SearchFilters {
  titleQuery: string;
  keywordQuery: string;
  authorQuery: string;
  abstractQuery: string;
  sortBy: "submissionDate" | "acceptedDate" | "title";
  sortOrder: "asc" | "desc";
  yearFilter: string;
}

// Prisma model types from schema
export interface User {
  id: string;
  name: string;
  email: string;
  areaOfInterest: string[];
  bio?: string;
  password?: string;
  affiliation?: string;
  profileImage?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  isVerified: boolean;
  userType: "AUTHOR" | "REVIEWER" | "EDITOR" | "ADMIN";
  variableUserType: "AUTHOR" | "REVIEWER" | "EDITOR" | "ADMIN";
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewerEntry {
  id: string;
  email: string;
  userType: string;
  isAuthenticated: boolean;
  name: string | null;
  affiliation: string | null;
  profileImage?: string | null;
  stats: {
    activeReviews: number;
    completedReviews: number;
    averageRating: number;
    expertise: string[];
  };
}

export interface UserWithStats extends User {
  _count?: {
    authoredPapers: number;
    reviews: number;
  };
}

export interface PaperReview {
  id: string;
  paperId: string;
  reviewerId: string;
  reviewText: string;
  reviewTextForAuthor?: string | null;
  correspondingFile?: string | null;
  rating?: number | null;
  createdAt: Date;
  updatedAt: Date;
  reviewerStatus?: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "ACCEPTED_FOR_REVIEW" | "REJECTED_FOR_REVIEW" | "PENDING" | "MINOR_REVISION" | "MAJOR_REVISION" | null;
}

export interface ResearchPaper {
  id: string;
  paperId: string;
  doi?: string | null;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  rating?: number | null;
  coverLetterPath?: string | null;
  correspondingFile?: string | null;
  editorDecisionFile?: string | null;
  editorDecision?: "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT" | null;
  editorComments?: string | null;
  submissionDate: Date;
  lastUpdated: Date;
  acceptedDate?: Date | null;
  status: "UPLOAD" | "REVIEWER_ALLOCATION" | "ON_REVIEW" | "EDITOR_DECISION" | "PUBLISH" | "ACCEPTED" | "REJECTED";
  authorId?: string | null;
  contributors: AuthorOrContact[] | any;
  pointOfContact: AuthorOrContact | any;
}

// Extended interfaces with relations for frontend use
export interface PaperReviewWithReviewer extends PaperReview {
  reviewer: User;
}

export interface PaperWithRelations extends ResearchPaper {
  reviews: PaperReviewWithReviewer[];
  author: User;
}

// API Response types
export interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export interface FetchPapersResponse {
  data: PaperWithRelations[];
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export interface ReviewFormData {
  reviewText: string;           // Private — editor only
  reviewTextForAuthor: string;  // Shared with author
  rating: number;
  correspondingFile: File | null;
  reviewerStatus: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "MINOR_REVISION" | "MAJOR_REVISION";
}

// Reviewer Dashboard specific types
export interface ReviewerStats {
  totalPapers: number;
  pendingReviews: number;
  readyToReview: number;
  completedReviews: number;
}

export interface AllocatedPaper extends ResearchPaper {
  reviewDeadline?: string;
  allocationDate?: string;
  reviewStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
}

// ─── New workflow types ───────────────────────────────────────────────────────

export type ManuscriptFileType =
  | "MANUSCRIPT_PDF"
  | "MANUSCRIPT_DOCX"
  | "COVER_LETTER"
  | "SOURCE_ZIP"
  | "RESPONSE_TO_REVIEWERS"
  | "EDITOR_DECISION_FILE"
  | "FINAL_PUBLICATION_FILE"
  | "OTHER";

export type FileAccessLevel =
  | "PUBLIC"
  | "AUTHOR_EDITOR"
  | "EDITOR_ONLY"
  | "REVIEWER_ASSIGNED";

export type AuditAction =
  | "AUTHOR_SUBMITTED_MANUSCRIPT"
  | "EDITOR_ASSIGNED_REVIEWER"
  | "REVIEWER_ACCEPTED_ASSIGNMENT"
  | "REVIEWER_REJECTED_ASSIGNMENT"
  | "REVIEWER_SUBMITTED_REVIEW"
  | "EDITOR_VIEWED_REVIEW"
  | "EDITOR_REQUESTED_REVISION"
  | "AUTHOR_SUBMITTED_REVISION"
  | "EDITOR_VIEWED_REVISION"
  | "EDITOR_SENT_REVISION_FOR_REVIEW"
  | "EDITOR_ACCEPTED_REVISION"
  | "EDITOR_REQUESTED_FURTHER_REVISION"
  | "EDITOR_REJECTED_PAPER"
  | "EDITOR_ACCEPTED_PAPER"
  | "EDITOR_REQUESTED_FINAL_FILES"
  | "AUTHOR_SUBMITTED_FINAL_FILES"
  | "AUTHORIZED_USER_ASSIGNED_DOI"
  | "AUTHORIZED_USER_UPLOADED_FINAL_FILES"
  | "PAPER_PUBLISHED"
  | "REVIEWER_ASSIGNMENT_CREATED"
  | "REVIEW_ROUND_CREATED";

export interface ManuscriptFile {
  id: string;
  paperId: string;
  revisionId: string | null;
  fileType: ManuscriptFileType;
  filePath: string;
  fileName: string;
  fileSize: number | null;
  uploadedAt: Date;
  uploadedById: string;
  accessLevel: FileAccessLevel;
  uploadedBy?: { id: string; name: string; email: string };
}

export interface ManuscriptRevision {
  id: string;
  paperId: string;
  revisionNumber: number;
  submittedById: string;
  submittedAt: Date;
  responseToReviewers: string | null;
  revisionNotes: string | null;
  visibleToReviewers: boolean;
  triggeredByRoundId: string | null;
  submittedBy?: { id: string; name: string; email: string };
  triggeredByRound?: { id: string; roundNumber: number } | null;
  files: ManuscriptFile[];
}

export interface ReviewRound {
  id: string;
  paperId: string;
  roundNumber: number;
  createdAt: Date;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  reviews?: PaperReviewWithReviewer[];
  revisions?: ManuscriptRevision[];
}

export interface ManuscriptAuditLogEntry {
  id: string;
  paperId: string;
  userId: string;
  action: AuditAction;
  metadata: Record<string, any> | null;
  createdAt: Date;
  user?: { id: string; name: string; email: string; userType: string };
}

/** Extended paper type with all new relations */
export interface PaperWithFullWorkflow extends PaperWithRelations {
  revisions: ManuscriptRevision[];
  reviewRounds: ReviewRound[];
  files: ManuscriptFile[];
  auditLogs?: ManuscriptAuditLogEntry[];
  canPublish?: boolean; // from User.canPublish on the session user
}
