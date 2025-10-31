"use client"

import * as React from "react"


import { NavMain } from "@/components/sidebarRoute"

import { NavUser } from "@/components/sidebarFooter"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"



import { UserTypeSwitcher } from "./user-role-switcher"
import { User } from "@prisma/client"


export function AppSidebar({ userData,...props }: { userData: User } & React.ComponentProps<typeof Sidebar>,) {
 
  
 
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <UserTypeSwitcher user={userData} />
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
