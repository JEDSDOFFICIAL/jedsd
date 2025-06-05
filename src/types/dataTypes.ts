
import { IconDashboard } from "@tabler/icons-react"
import {
  AreaChart,
  BrainCircuit,
  Home,
  LucideLayoutDashboard,
  LucidePaperclip,
  Newspaper,
  PartyPopper,
  Search,
  Upload,
  UserIcon,
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
      { title: "Paper Request",icon:LucidePaperclip, url: "dashboard/paperwork" },
    ],
  },
  {
    title: "Admin Work Panel",
    url: "#",
    icon: BrainCircuit ,
    access: ["ADMIN"],
    items: [
      { title: "Reviewer List Work", url: "dashboard/reviewerlist" ,icon:UserPenIcon},
      { title: "Paper Work", url: "dashboard/paperworkadmin" ,icon:PartyPopper},
      { title: "User List", url: "dashboard/userlist" ,icon:UserIcon},
      { title: "Latest News", url: "dashboard/news" ,icon:Newspaper},
    ],
  },
]
