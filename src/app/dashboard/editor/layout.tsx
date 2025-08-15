"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname.includes("/reviewer-allocation")) return "allocation";
    if (pathname.includes("/paper-reviews")) return "reviews";
    if (pathname.includes("/publications")) return "publications";
    return "allocation"; // Default to allocation
  };

  const handleTabChange = (value: string) => {
    if (value === "allocation") {
      router.push("/dashboard/editor/reviewer-allocation");
    } else if (value === "reviews") {
      router.push("/dashboard/editor/paper-reviews");
    } else if (value === "publications") {
      router.push("/dashboard/editor/publications");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage paper assignments, reviews, and publications
        </p>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allocation">Reviewer Allocation</TabsTrigger>
          <TabsTrigger value="reviews">Paper Reviews</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="allocation" className="mt-6">
          {pathname.includes("/reviewer-allocation") && children}
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          {pathname.includes("/paper-reviews") && children}
        </TabsContent>
        
        <TabsContent value="publications" className="mt-6">
          {pathname.includes("/publications") && children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
