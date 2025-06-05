// Page.tsx
"use client";

import { DashboardSectionCards } from "@/components/dashboard/DashboardCard";
import {DashboardPaperList} from "@/components/dashboard/paper/DashboadPaperList";
// No need to import SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, useSidebar here
// because SidebarInset in RootLayout handles the layout adjustment.

export default function Page() {
  

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100  w-full min-h-fit h-full">
     <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashboardSectionCards />

              <DashboardPaperList />
            </div>
          </div>
        </div>
     
    </div>
  );
}