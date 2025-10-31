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
      { title: "Reviewer Management", url: "/dashboard/editor/reviewers", icon: Users, access: ["EDITOR"] },
      { title: "Read Reviews", url: "/dashboard/editor/reviews", icon: FileSignature, access: ["EDITOR"] },
     
    ],
  },
  {
    title: "Admin Panel",
    url: "#",
    icon: Users,
    access: ["ADMIN"],
    items: [
      { title: "User Management", url: "/dashboard/admin/users", icon: Users },
      { title: "Role Management", url: "/dashboard/admin/roles", icon: UserCog },
      { title: "Paper Management", url: "/dashboard/admin/papers", icon: FileText },
      { title: "System Settings", url: "/dashboard/admin/settings", icon: Settings },
    ],
  },

  // PROFILE & SETTINGS (shared)
  {
    title: "Profile & Settings",
    url: "#",
    icon: UserCog,
    access: ["AUTHOR", "REVIEWER", "EDITOR", "ADMIN"],
    items: [
      { title: "Profile Setup", url: "/dashboard/profile", icon: UserCog },
    ],
  },

 
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
  reviewText: string;
  rating: number;
  correspondingFile: File | null;
  reviewerStatus: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION";
  confidentialComments?: string;
  recommendation?: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "MINOR_REVISION" | "MAJOR_REVISION";
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
