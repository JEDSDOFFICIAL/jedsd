"use client";


import React from "react";

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

// Function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export function PaperDetailsList({paper}:{paper?: ExtendedResearchPaper}) {
  
    if (!paper) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-gray-600">Loading paper details...</p>
        </div>
      );
    }
  
  return (
    <div className="p-4 bg-background rounded-lg border shadow-sm">
      <style jsx>{`
        .truncate-text-single-line {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .truncate-text-multi-line {
          display: -webkit-box;
          -webkit-line-clamp: 3; /* Limit to 3 lines */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal; /* Allow text to wrap within the lines */
        }
      `}</style>

      <h2 className="text-xl font-bold mb-4">Paper Details</h2>

      <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
        {/* Core Paper Information */}
        <li className="flex items-start">
          <strong className="min-w-[120px] shrink-0">Title:</strong>
          <span className="truncate-text-single-line flex-grow">{paper.title}</span>
        </li>
        <li className="flex items-start">
          <strong className="min-w-[120px] shrink-0">Paper ID:</strong>
          <span className="truncate-text-single-line flex-grow">{paper.id}</span>
        </li>
        <li className="flex items-start">
          <strong className="min-w-[120px] shrink-0">Submission Date:</strong>
          <span className="truncate-text-single-line flex-grow">{formatDate(paper.submissionDate)}</span>
        </li>
        <li className="flex items-start">
          <strong className="min-w-[120px] shrink-0">Last Updated:</strong>
          <span className="truncate-text-single-line flex-grow">{formatDate(paper.lastUpdated)}</span>
        </li>
        <li className="flex items-start">
          <strong className="min-w-[120px] shrink-0">Status:</strong>
          <span className="truncate-text-single-line flex-grow">{paper.status}</span>
        </li>
        <li className="flex items-start">
          <strong className="min-w-[120px] shrink-0">Current Version:</strong>
          <span className="truncate-text-single-line flex-grow">{paper.currentVersion}</span>
        </li>

        {/* Abstract Section */}
        <li className="pt-2">
          <h3 className="font-semibold text-lg mb-1">Abstract</h3>
          <p className="truncate-text-multi-line text-gray-700 dark:text-gray-300">
            {paper.abstract}
          </p>
        </li>

        {/* Rejection Information (conditionally rendered) */}
        {(paper.rejectionRemark || paper.rejectionDate) && (
          <li className="pt-2">
            <h3 className="font-semibold text-lg mb-1">Rejection Information</h3>
            <ul className="pl-4 space-y-1">
              {paper.rejectionRemark && (
                <li className="flex items-start">
                  <strong className="min-w-[80px] shrink-0">Remark:</strong>
                  <span className="truncate-text-single-line flex-grow">{paper.rejectionRemark}</span>
                </li>
              )}
              {paper.rejectionDate && (
                <li className="flex items-start">
                  <strong className="min-w-[80px] shrink-0">Date:</strong>
                  <span className="truncate-text-single-line flex-grow">{formatDate(paper.rejectionDate)}</span>
                </li>
              )}
            </ul>
          </li>
        )}

        {/* Files Section */}
        <li className="pt-2">
          <h3 className="font-semibold text-lg mb-1">Files</h3>
          <ul className="pl-4 space-y-1">
            <li className="flex items-start">
              <strong className="min-w-[100px] shrink-0">Paper File:</strong>
              <a
                href={paper.filePath}
                target="_blank"
                rel="noopener noreferrer"
                download={paper.filePath.split("/").pop()} // Suggests filename for download
                className="text-blue-600 hover:underline truncate-text-single-line flex-grow"
              >
                Download Paper
              </a>
            </li>
            {
              paper.coverLetterPath && paper.coverLetterPath !== "" ? (
                <li className="flex items-start">
                  <strong className="min-w-[100px] shrink-0">Cover Letter:</strong>
                  <a
                    href={paper.coverLetterPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={paper.coverLetterPath.split("/").pop()} // Suggests filename for download
                    className="text-blue-600 hover:underline truncate-text-single-line flex-grow"
                  >
                    Download Cover Letter
                  </a>
                </li>
              ) : (
                <li className="flex items-start">
                  <strong className="min-w-[100px] shrink-0">Cover Letter:</strong>
                  <span className="truncate-text-single-line flex-grow text-gray-500">No cover letter provided</span>
                </li>
              )
            }
            
          </ul>
        </li>

        {/* Keywords Section */}
        <li className="pt-2">
          <h3 className="font-semibold text-lg mb-1">Keywords</h3>
          <ul className="pl-4 space-y-1">
            {paper.keywords.map((keyword, index) => (
              <li key={`keyword-${index}`} className="truncate-text-single-line">
                {keyword}
              </li>
            ))}
          </ul>
        </li>

        {/* Author & Contributors Section */}
        <li className="pt-2">
          <h3 className="font-semibold text-lg mb-1">Author & Contributors</h3>
          <ul className="pl-4 space-y-1">
            <li className="flex items-start">
              <strong className="min-w-[60px] shrink-0">Author:</strong>
              <span className="truncate-text-single-line flex-grow">{paper.author?.name} ({paper.author?.email})</span>
            </li>
            <li className="pt-1">
              <h4 className="font-medium text-base mb-1">Point of Contact</h4>
              <ul className="pl-4 space-y-1">
                <li className="flex items-start">
                  <strong className="min-w-[100px] shrink-0">Full Name:</strong>
                  <span className="truncate-text-single-line flex-grow">{paper.pointOfContact.fullName}</span>
                </li>
                <li className="flex items-start">
                  <strong className="min-w-[100px] shrink-0">Email:</strong>
                  <span className="truncate-text-single-line flex-grow">{paper.pointOfContact.email}</span>
                </li>
                <li className="flex items-start">
                  <strong className="min-w-[100px] shrink-0">Contact:</strong>
                  <span className="truncate-text-single-line flex-grow">{paper.pointOfContact.contactNumber}</span>
                </li>
                <li className="flex items-start">
                  <strong className="min-w-[100px] shrink-0">Affiliation:</strong>
                  <span className="truncate-text-single-line flex-grow">{paper.pointOfContact.affiliation}</span>
                </li>
              </ul>
            </li>
            <li className="pt-1">
              <h4 className="font-medium text-base mb-1">Contributors</h4>
              <ul className="pl-4 space-y-1">
                {paper.contributors.map((contributor, index) => (
                  <li key={`contributor-${index}`} className="truncate-text-single-line">
                    {contributor.fullName} ({contributor.email}) - {contributor.affiliation}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </li>

        {/* Reviewer Information (conditionally rendered) */}
        {paper.reviewer && (
          <li className="pt-2">
            <h3 className="font-semibold text-lg mb-1">Reviewer</h3>
            <ul className="pl-4 space-y-1">
              <li className="flex items-start">
                <strong className="min-w-[60px] shrink-0">Name:</strong>
                <span className="truncate-text-single-line flex-grow">{paper.reviewer.name}</span>
              </li>
              <li className="flex items-start">
                <strong className="min-w-[60px] shrink-0">Email:</strong>
                <span className="truncate-text-single-line flex-grow">{paper.reviewer.email}</span>
              </li>
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}