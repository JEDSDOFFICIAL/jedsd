import {
  LayoutDashboard,
  Home,
  Upload,
  Search,
  Paperclip,
  Users,
  UserCog,
  FileText,
  UserCheck,
  FileSignature,
  BookOpenCheck,
  LineChart,
  Settings,
  HelpCircle,
  PartyPopper,
  Brain,
} from "lucide-react";

export const DashboardItems = [
  {
    title: "Main",
    url: "#",
    icon: LayoutDashboard,
    isActive: true,
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Overview Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Upload Research Paper", url: "/dashboard/paper/upload", icon: Upload },
      { title: "Search Papers", url: "/dashboard/paper/search", icon: Search },
      { title: "Analytics & Reports", url: "/dashboard/analytics", icon: LineChart },
    ],
  },
  {
    title: "Reviewer Panel",
    url: "#",
    icon: FileSignature,
    access: ["REVIEWER"],
    items: [
      { title: "Review Dashboard", url: "/dashboard/reviewer", icon: FileSignature },
    ],
  },
  {
    title: "Editor Panel",
    url: "#",
    icon: Brain,
    access: ["EDITOR"],
    items: [
      { title: "Assign Reviewers", url: "/dashboard/editor/reviewer-allocation", icon: UserCheck },
      { title: "Manage Reviews", url: "/dashboard/editor/paper-reviews", icon: FileSignature },
      { title: "Manage Publications", url: "/dashboard/editor/publications", icon: BookOpenCheck },
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
  {
    title: "Profile & Settings",
    url: "#",
    icon: UserCog,
    items: [
      { title: "Profile Setup", url: "/dashboard/profile", icon: UserCog },
      { title: "Account Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    title: "Support",
    url: "#",
    icon: HelpCircle,
    items: [
      { title: "Help Center", url: "/help", icon: HelpCircle },
      { title: "Contact Support", url: "/contact-support", icon: PartyPopper },
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
