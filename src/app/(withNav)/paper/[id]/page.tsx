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
import AuthorBadges from "./AuthorBadges";


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

// Server-side metadata generation for social sharing and SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/paper/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Paper Not Found - JEDSD',
        description: 'The research paper you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const data = await response.json();
    const paper = data.paper;

    const authors = paper.contributors 
      ? (typeof paper.contributors === 'string' ? JSON.parse(paper.contributors) : paper.contributors)
      : [];
    
    const authorsNames = authors.map((c: any) => c.fullName).join(', ');
    const firstAuthor = authors[0]?.fullName || paper.author?.name || 'Unknown Author';
    
    // Create a comprehensive description
    const description = paper.abstract.length > 160 
      ? paper.abstract.substring(0, 157) + '...'
      : paper.abstract;

    // Format keywords as array
    const keywords = Array.isArray(paper.keywords) 
      ? paper.keywords 
      : typeof paper.keywords === 'string' 
        ? paper.keywords.split(',').map((k: string) => k.trim())
        : [];

    const canonicalUrl = `${baseUrl}/paper/${id}`;

    return {
      title: `${paper.title} | ${firstAuthor} | JEDSD`,
      description: description,
      keywords: [
        ...keywords,
        'research paper',
        'academic journal',
        'embedded systems',
        'digital system design',
        'JEDSD',
        'peer-reviewed',
      ],
      authors: authors.map((author: any) => ({ name: author.fullName })),
      creator: firstAuthor,
      publisher: 'JEDSD - Journal of Embedded and Digital System Design',
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: paper.status === 'PUBLISH',
        follow: true,
        googleBot: {
          index: paper.status === 'PUBLISH',
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: paper.title,
        description: description,
        type: 'article',
        url: canonicalUrl,
        siteName: 'JEDSD - Journal of Embedded and Digital System Design',
        publishedTime: paper.acceptedDate || paper.submissionDate,
        modifiedTime: paper.acceptedDate || paper.submissionDate,
        authors: authors.map((author: any) => author.fullName),
        tags: keywords,
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: paper.title,
        description: description,
        creator: '@JEDSD',
        site: '@JEDSD',
      },
      other: {
        'citation_title': paper.title,
        'citation_author': authorsNames,
        'citation_publication_date': paper.acceptedDate || paper.submissionDate,
        'citation_journal_title': 'JEDSD - Journal of Embedded and Digital System Design',
        'citation_pdf_url': paper.filePath || '',
        'citation_doi': paper.doi || '',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'JEDSD - Research Paper',
      description: 'View research paper details',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

// Server Component - Fetch data on the server
export default async function PaperDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let paper: ResearchPaper | null = null;
  let contributors: any[] = [];
  let pointOfContact: any = null;

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/paper/${id}`, {
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

  // Generate JSON-LD structured data for Google Scholar and search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: paper.title,
    abstract: paper.abstract,
    author: contributors.map((author: any) => ({
      '@type': 'Person',
      name: author.fullName,
      email: author.email,
      affiliation: author.affiliation ? {
        '@type': 'Organization',
        name: author.affiliation,
      } : undefined,
    })),
    datePublished: paper.acceptedDate || paper.submissionDate,
    dateModified: paper.acceptedDate || paper.submissionDate,
    publisher: {
      '@type': 'Organization',
      name: 'JEDSD - Journal of Embedded and Digital System Design',
    },
    inLanguage: 'en',
    keywords: Array.isArray(paper.keywords) ? paper.keywords.join(', ') : paper.keywords,
    isAccessibleForFree: true,
    ...(paper.doi && { identifier: paper.doi }),
    ...(paper.filePath && { 
      encoding: {
        '@type': 'MediaObject',
        contentUrl: paper.filePath,
        encodingFormat: 'application/pdf',
      }
    }),
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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
              </div>
            </div>

            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Authors Badges - Before Abstract */}
            {contributors.length > 0 && (
              <AuthorBadges contributors={contributors} />
            )}

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={paper.filePath} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Paper
                  </Link>
                </Button>

                <PaperDetailsClient paper={paper} />
              </CardContent>
            </Card>

            {/* Paper Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Paper Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paper.doi && (
                  <>
                    <div className="flex flex-col">
                      <Label className="text-base font-medium">DOI</Label>
                      <Link
                        href={paper.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-muted-foreground font-mono hover:text-primary hover:underline break-all"
                      >
                        {paper.doi}
                      </Link>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <Label className="text-base font-medium">Status</Label>
                  <p className="text-base text-muted-foreground">
                    <Badge
                      variant={
                        paper.status === "PUBLISH" ? "default" : "secondary"
                      }
                    >
                      {paper.status}
                    </Badge>
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Submission Date</Label>
                  <p className="text-base text-muted-foreground">
                    {formatDate(paper.submissionDate)}
                  </p>
                </div>

                {paper.acceptedDate && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-medium">
                        Publication Date
                      </Label>
                      <p className="text-base text-muted-foreground">
                        {formatDate(paper.acceptedDate)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Keywords - Full Width */}
        {paper.keywords && paper.keywords.length > 0 && (
          <Card className="w-full my-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Tag className="h-5 w-5" />
                Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-between w-full">
                {paper.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-lg">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
    </>
  );
}
