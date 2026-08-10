"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/hooks/use-user-data";
import { RoleProvider, useRole } from "@/contexts/RoleContext";

function DashboardHeader() {
  const { userDetails, isLoading } = useUserData();
  const { currentRole, isRoleSwitched } = useRole();

  return (
    <header className="flex h-16 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>
              {isLoading ? "Loading..." : userDetails?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isLoading ? "..." : userDetails?.email}
            </BreadcrumbPage>
          </BreadcrumbItem>
          {currentRole && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <Badge variant={isRoleSwitched ? "secondary" : "default"}>
                  {currentRole}
                  {isRoleSwitched && " (Switched)"}
                </Badge>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { userDetails, isLoading } = useUserData();
  const [mounted, setMounted] = useState(false);

  // Set mounted to true to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-render guard for SSR
  if (!mounted) return null;

  return (
    <SidebarProvider className="h-screen w-full">
      {userDetails && !isLoading && <AppSidebar userData={userDetails} />}
      <SidebarInset className="flex h-full w-full flex-col gap-1 overflow-hidden">
        <DashboardHeader />
        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-2">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <DashboardContent>{children}</DashboardContent>
    </RoleProvider>
  );
}
