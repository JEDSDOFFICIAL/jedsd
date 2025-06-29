"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { User } from "@prisma/client";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (session?.user?.email) {
          const res = await axios.get(`/api/user/getUser?email=${session.user.email}`);
          setUserDetails(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    fetchUserDetails();
  }, [session]);

  return (
    <SidebarProvider className="h-screen w-full">
      {userDetails && <AppSidebar userData={userDetails} />}
      <SidebarInset className="flex h-full w-full flex-col gap-1 overflow-hidden ">
        {/* Header with SidebarTrigger and Breadcrumb */}
     
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 overflow-y-auto">


        {children}
        </div>
     </SidebarInset>
    </SidebarProvider>
  );
}
