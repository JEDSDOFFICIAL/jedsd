"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import React from "react"; // Required for React.use()

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // For 'Cite This' and 'PDF' buttons
import { Separator } from "@/components/ui/separator"; // For separating sections
import { DownloadIcon } from "lucide-react";
type UserDetails = {
  id: string;
  name: string;
  email: string;
};

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

// This type extends Prisma's ResearchPaper with relational data and parsed JSON fields
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

type PaperDetailProps = {
  params: Promise<{ paperId: string }>;
};

// --- Component Definition ---

export default function PaperDetailsPage({ params }: PaperDetailProps) {
  const [paper, setPaper] = useState<ExtendedResearchPaper | null>(null);
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { paperId } = unwrappedParams;

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

  if (!paper) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading paper details...</p>
      </div>
    );
  }

  // Helper for formatting dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-4 w-full h-fit lg:pt-36 md:pt-40 pt-36 ">
      {/* Main Content Area */}
      <main className="md:col-span-1 md:col-start-2">
        <h1 className="lg:text-4xl md:text-3xl text-2xl w-full text-center text-shadow-accent font-bold py-4">
          {paper.title}
        </h1>
        <section
          id="abstract"
          className="py-3 border-t-2 border-b-2 border-black"
        >
          <h2 className="text-2xl font-bold mb-4">Abstract</h2>
          <p className="text-gray-700">{paper.abstract}</p>
        </section>
        {/* Publisher and Actions */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 py-6   ">
          <a
            href={paper.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer w-fit h-fit"
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer bg-blue-900 text-white hover:bg-blue-800 transition-colors duration-200 border border-black"
            >
              <DownloadIcon className="h-4 w-4" />
              Download Paper
            </Button>
          </a>
        </div>

        {/* Authors and Citations/Views */}
        <div className="mb-6">
          {paper.contributors && paper.contributors.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Contributors</h2>
              <div className="max-w-full space-x-2 overflow-x-auto flex flex-wrap gap-4">
                {paper.contributors.map((contributor, index) => (
                  <div
                    key={index}
                    className="py-2 border border-gray-200 rounded-lg px-4 w-fit h-fit"
                    style={{
                      boxShadow:
                        "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
                    }}
                  >
                    <p className="font-medium">{contributor.fullName}</p>
                  </div>
                ))}{" "}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Abstract Section */}

        {/* Publication Details */}
        <section className="mb-8 text-sm text-gray-700">
          <p className="mb-2">
            <span className="font-semibold">Date Added to JEDSD :</span>{" "}
            {formatDate(paper.submissionDate)}
          </p>
        </section>

        {/* Additional Paper Details (from your original code, adapted for data) */}
        <Separator className="my-6" />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Paper Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Paper ID</p>
              <p className="font-medium">{paper.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Status</p>
              <Badge variant="outline" className="capitalize text-sm">
                {paper.status.toLowerCase()}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Keywords</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {paper.keywords.map((k) => (
                <Badge key={k} className="bg-sky-100 text-sky-800 text-lg">
                  {k}
                </Badge>
              ))}
            </div>
          </div>

          {paper.author && (
            <div>
              <p className="text-muted-foreground text-sm">Uploader</p>
              <p>
                {paper.author.name} ({paper.author.email})
              </p>
            </div>
          )}
          {paper.reviewer && (
            <div>
              <p className="text-muted-foreground text-sm">Reviewer</p>
              <p>
                {paper.reviewer.name} ({paper.reviewer.email})
              </p>
            </div>
          )}

          <div className="text-muted-foreground text-xs">
            <p>Submitted: {new Date(paper.submissionDate).toLocaleString()}</p>
            <p>Last Updated: {new Date(paper.lastUpdated).toLocaleString()}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
