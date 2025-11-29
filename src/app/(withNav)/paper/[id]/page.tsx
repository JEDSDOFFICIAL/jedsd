import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Calendar,
  User,
  Tag,
  FileText,
  ExternalLink,
  Download,
  Mail,
  Building,
  Eye,
  Share,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import PaperDetailsClient from "./PaperDetailsClient";

interface ResearchPaper {
  id: string;
  paperId: string;
  doi?: string;
  title: string;
  abstract: string;
  keywords: string[];
  submissionDate: string;
  acceptedDate?: string;
  status: string;
  filePath: string;
  coverLetterPath?: string;
  rating?: number;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  contributors?: any[];
  pointOfContact?: any;
  reviews?: any[];
}

// Server-side metadata generation for social sharing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/paper/${params.id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Paper Not Found - JEDSD',
        description: 'The research paper you are looking for does not exist.',
      };
    }

    const data = await response.json();
    const paper = data.paper;

    const authors = paper.contributors 
      ? (typeof paper.contributors === 'string' ? JSON.parse(paper.contributors) : paper.contributors)
      : [];
    
    const authorsNames = authors.map((c: any) => c.fullName).join(', ');

    return {
      title: `${paper.title} - JEDSD`,
      description: paper.abstract.substring(0, 160) + '...',
      keywords: paper.keywords || [],
      authors: authorsNames ? [{ name: authorsNames }] : undefined,
      openGraph: {
        title: paper.title,
        description: paper.abstract.substring(0, 200) + '...',
        type: 'article',
        url: `${baseUrl}/paper/${params.id}`,
        siteName: 'JEDSD - Journal of Engineering and Digital Systems Development',
        publishedTime: paper.acceptedDate || paper.submissionDate,
        authors: authorsNames ? [authorsNames] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: paper.title,
        description: paper.abstract.substring(0, 200) + '...',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'JEDSD - Research Paper',
      description: 'View research paper details',
    };
  }
}

// Server Component - Fetch data on the server
export default async function PaperDetailsPage({ params }: { params: { id: string } }) {
  let paper: ResearchPaper | null = null;
  let contributors: any[] = [];
  let pointOfContact: any = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/paper/${params.id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    paper = data.paper;

    // Parse JSON fields
    if (paper?.contributors) {
      try {
        const contributorsData =
          typeof paper.contributors === "string"
            ? JSON.parse(paper.contributors)
            : paper.contributors;
        contributors = Array.isArray(contributorsData) ? contributorsData : [];
      } catch (e) {
        console.error("Error parsing contributors:", e);
      }
    }

    if (paper?.pointOfContact) {
      try {
        const pocData =
          typeof paper.pointOfContact === "string"
            ? JSON.parse(paper.pointOfContact)
            : paper.pointOfContact;
        pointOfContact = pocData;
      } catch (e) {
        console.error("Error parsing point of contact:", e);
      }
    }
  } catch (error) {
    console.error("Error fetching paper details:", error);
    notFound();
  }

  if (!paper) {
    notFound();
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden scroll-smooth">
      <div className="container mx-auto px-4 w-full">
        {/* Header */}
        <div className="my-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4 leading-tight">
                {paper.title}
              </h1>

              {/* Paper Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {paper.author && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-base"
                  >
                    <User className="h-3 w-3" />
                    {paper.author.name}
                  </Badge>
                )}

                <Badge variant="outline" className="flex items-center gap-1 text-base">
                  <Calendar className="h-3 w-3" />
                  Submitted: {formatDate(paper.submissionDate)}
                </Badge>

                {paper.acceptedDate && (
                  <Badge variant="default" className="flex items-center gap-1 text-base">
                    <Calendar className="h-3 w-3" />
                    Published: {formatDate(paper.acceptedDate)}
                  </Badge>
                )}
                {paper.doi && (
                  <Link href={paper.doi} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="flex items-center gap-1 text-base hover:bg-green-300 cursor-pointer hover:text-white hover:underline duration-150 hover:border border-green-700">
                      <ExternalLink className="h-3 w-3" />
                      {paper.doi}
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            <PaperDetailsClient paper={paper} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abstract */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="h-5 w-5" />
                  Abstract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-justify">
                  {paper.abstract}
                </p>
              </CardContent>
            </Card>

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Tag className="h-5 w-5" />
                    Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-lg">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Authors */}
            {contributors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Authors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contributors.map((contributor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="font-semibold text-sm">
                        {contributor.fullName}
                      </div>
                      {contributor.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <a
                            href={`mailto:${contributor.email}`}
                            className="hover:text-primary hover:underline break-all"
                          >
                            {contributor.email}
                          </a>
                        </div>
                      )}
                      {contributor.affiliation && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Building className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{contributor.affiliation}</span>
                        </div>
                      )}
                      {index < contributors.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {paper.filePath && (
          <Card className="w-full my-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5" />
                Paper Preview
              </CardTitle>
              <CardDescription>
                Viewing first 3 pages - Open full paper to see all pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <iframe
                  src={`${paper.filePath}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full md:h-[600px] lg:h-[800px] h-[400px] border rounded-lg"
                  title="PDF Preview"
                />
                <div className="mt-4 flex justify-center">
                  <Link href={paper.filePath} target="_blank">
                    <Button size="lg" className="w-full sm:w-auto">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Full Paper
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
