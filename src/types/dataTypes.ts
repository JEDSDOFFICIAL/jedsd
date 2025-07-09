import { IconDashboard } from "@tabler/icons-react"
import {
  AreaChart,
  BrainCircuit,
  EditIcon,
  Home,
  LucideLayoutDashboard,
  LucidePaperclip,
  Newspaper,
  PartyPopper,
  Search,
  Upload,
  UserIcon,
  UserPen,
  UserPenIcon,
} from "lucide-react"
// This is sample data.


export const DashboardItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: LucideLayoutDashboard,
    isActive: true,
    items: [
      { title: "Home", url: "/",icon:Home },
      { title: "Dashboard", url: "dashboard" ,icon:IconDashboard},
      { title: "Upload Paper", url: "dashboard/paper/upload",icon: Upload },
      { title: "Search a Paper", url: "paper",icon: Search },
    ],
  },
  {
    title: "Reviewer Work Panel",
    url: "#",
    icon: AreaChart,
    access: ["REVIEWER"],
    items: [
      { title: "Paper Request",icon:LucidePaperclip, url: "dashboard/paperworkreviewer" },
      
    ],
  },
  {
    title: "Editor Work Panel",
    url: "#",
    icon: UserPen,
    access: ["EDITOR"],
    items: [
      { title: "Edit Papers", icon: UserPenIcon, url: "dashboard/editwork" },
      { title: "Editor Paper Work", url: "dashboard/paperworkeditor", icon: EditIcon },
    ],
  },
  {
    title: "Admin Work Panel",
    url: "#",
    icon: BrainCircuit ,
    access: ["ADMIN"],
    items: [
      { title: "Paper Workflow Management", url: "dashboard/workflow", icon: PartyPopper },
      { title: "Reviewer List Work", url: "dashboard/reviewerlist" ,icon:UserPenIcon},
      { title: "User List", url: "dashboard/userlist" ,icon:UserIcon},
    ],
  },
]


export type AuthorOrContact = {
  fullName: string;
  affiliation?: string;
  gmail: string;
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
