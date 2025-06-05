"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"



import { UserTypeSwitcher } from "./user-type-switcher"
import { User } from "@prisma/client"


export function AppSidebar({ userData,...props }: { userData: User } & React.ComponentProps<typeof Sidebar>,) {
 
  
 
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <UserTypeSwitcher {...userData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain {...userData} />
        
      </SidebarContent>
      <SidebarFooter>
        <NavUser {...userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
