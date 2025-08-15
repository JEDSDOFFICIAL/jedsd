"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  {
    name: "Users",
    href: "/dashboard/admin/users",
    description: "Manage system users"
  },
  {
    name: "Papers", 
    href: "/dashboard/admin/papers",
    description: "Oversee all papers"
  },
  {
    name: "Roles",
    href: "/dashboard/admin/roles", 
    description: "Manage user roles"
  },
  {
    name: "Settings",
    href: "/dashboard/admin/settings",
    description: "System configuration"
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === tab.href 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {children}
      </main>
    </div>
  );
}
