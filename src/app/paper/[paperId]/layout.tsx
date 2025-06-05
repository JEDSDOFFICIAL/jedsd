"use client";

// components/dashboard/paper/paperLayout.tsx (your Layout component)


import { PaperDetailsList } from "@/components/dashboard/paper/paperSidebar"; // Assuming updated name and path
import axios from "axios";
import { useRouter,useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
 // Adjusted Contributor type based on your sample data
type ContributorData = {
  affiliation?: string;
  contactNumber?: string;
  email: string;
  fullName: string;
};

// Adjusted PointOfContact type based on your sample data
type PointOfContactData = {
  affiliation?: string;
  contactNumber?: string;
  email: string;
  fullName: string;
};

type UserDetails = {
  id: string;
  name: string;
  email: string;
};

type ExtendedResearchPaper = {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  coverLetterPath: string | null;
  currentVersion: number;
  submissionDate: string; // Use string for Date objects coming from JSON (will parse in component)
  lastUpdated: string; // Use string for Date objects coming from JSON (will parse in component)
  rejectionRemark: string | null;
  rejectionDate: string | null;
  status: "UPLOAD" | "ON_REVIEW" | "PUBLISH" | "REJECTED"; // From PaperStatus enum
  reviewerId: string | null;
  authorId: string | null;
  contributors: ContributorData[]; // Now an array of ContributorData
  pointOfContact: PointOfContactData; // Now PointOfContactData
  author?: UserDetails; // Optional because it might not always be included
  reviewer?: UserDetails | null; // Optional and can be null
};
export default function Layout({ children }: { children: React.ReactNode }) {
 

  const [paper, setPaper] = useState<ExtendedResearchPaper | null>(null);
    const router = useRouter();
    // Use useParams to get route parameters
    // If you are using Next.js 13+ with app directory:
    // import { useParams } from "next/navigation"; (already imported useRouter)
    // @ts-ignore
    const { paperId } = useParams() as { paperId: string };
  
    useEffect(() => {
      const fetchPaperDetails = async () => {
        try {
          const response = await axios.get(`/api/paper/${paperId}`);
          setPaper({
            ...response.data,
            submissionDate: new Date(response.data.submissionDate).toISOString(), // Keep as string or convert to Date if actual Date object is needed.
            lastUpdated: new Date(response.data.lastUpdated).toISOString(),
            rejectionDate: response.data.rejectionDate
              ? new Date(response.data.rejectionDate).toISOString()
              : null,
          } as ExtendedResearchPaper);
        } catch (error) {
          console.error("Error fetching paper details:", error);
          // Using router.push("/404") is a good practice for not found errors
          router.push("/404");
        } finally {
          console.log("Paper details fetch attempt completed.");
        }
      };
  
      if (paperId) {
        // Only fetch if paperId is available
        fetchPaperDetails();
      }
    }, [paperId, router]); // Include router in dependencies
  
  return (
    <div className="w-full h-screen flex"> {/* Removed justify-center items-center from main div */}
      <aside className="sidebar hidden lg:block lg:w-1/3 xl:1/4 h-full bg-gray-600 p-4 overflow-y-auto overflow-x-auto scrollbar-hide">
        {/* No need for a min-w-max wrapper here, as PaperDetailsList manages its internal width */}
        <PaperDetailsList paper={paper ?? undefined} />
      </aside>
      <main className="p-4 h-full overflow-y-auto scrollbar-hide lg:w-2/3 xl:3/4 w-full">{children}</main>
    </div>
  );
}