import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
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
    const baseUrl = process.env.NEXTAUTH_URL || 'https://jedsd.com';

    // Use direct Prisma query — avoids internal HTTP round-trip that breaks when
    // NEXTAUTH_URL is localhost (common in production misconfiguration)
    const paper = await prisma.researchPaper.findFirst({
      where: {
        OR: [{ paperId: id }, { id }],
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!paper) {
      return {
        title: 'Paper Not Found - JEDSD',
        description: 'The research paper you are looking for does not exist.',
        robots: { index: false, follow: false },
      };
    }

    // Index only published papers
    const isPublished = paper.status === 'PUBLISH' || paper.status === 'PUBLISHED';

    const authors: any[] = paper.contributors
      ? (typeof paper.contributors === 'string'
          ? JSON.parse(paper.contributors as string)
          : paper.contributors as any[])
      : [];

    const firstAuthor = authors[0]?.fullName || paper.author?.name || 'Unknown Author';

    const description =
      paper.abstract.length > 160
        ? paper.abstract.substring(0, 157) + '...'
        : paper.abstract;

    const keywords: string[] = Array.isArray(paper.keywords)
      ? paper.keywords
      : typeof paper.keywords === 'string'
      ? (paper.keywords as string).split(',').map((k: string) => k.trim())
      : [];

    const canonicalUrl = `${baseUrl}/paper/${paper.paperId}`;

    const pubDate = paper.acceptedDate || paper.submissionDate;
    const publicationDate = new Date(pubDate).toISOString().split('T')[0];
    const year = new Date(pubDate).getFullYear().toString();
    const month = (new Date(pubDate).getMonth() + 1).toString().padStart(2, '0');

    // Volume/issue defaults — replace with real values once you add them to the schema
    // Volume 1 = 2025, Volume 2 = 2026, etc. (relative to journal launch year 2025)
    const launchYear = 2025;
    const pubYear = new Date(pubDate).getFullYear();
    const volumeStr = String(pubYear - launchYear + 1);
    const issueStr = month; // month as issue number until proper issue tracking is added
    const pageStartStr = '1';
    const pageEndStr = ''; // unknown until set manually

    // Strip https://doi.org/ prefix if present — citation_doi needs just the identifier
    const doiIdentifier = paper.doi
      ? paper.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
      : '';

    // Build individual citation_author entries (one per author — Scholar requirement)
    const authorMetaTags: Record<string, string> = {};
    authors.forEach((author: any, index: number) => {
      if (index === 0) {
        // First author uses the standard key name
        authorMetaTags['citation_author'] = author.fullName;
      } else {
        // Additional authors use indexed keys — Next.js renders each as a separate <meta> tag
        authorMetaTags[`citation_author_${index}`] = author.fullName;
      }
    });
    if (authors.length === 0) {
      authorMetaTags['citation_author'] = paper.author?.name || 'Unknown Author';
    }

    // Build author affiliation tags
    const affiliationTags: Record<string, string> = {};
    authors.forEach((author: any, index: number) => {
      if (author.affiliation) {
        const key = index === 0 ? 'citation_author_institution' : `citation_author_institution_${index}`;
        affiliationTags[key] = author.affiliation;
      }
    });

    return {
      title: `${paper.title} | ${firstAuthor} | JEDSD`,
      description,
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
      alternates: { canonical: canonicalUrl },
      robots: {
        index: isPublished,
        follow: true,
        googleBot: {
          index: isPublished,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: paper.title,
        description,
        type: 'article',
        url: canonicalUrl,
        siteName: 'JEDSD - Journal of Embedded and Digital System Design',
        publishedTime: paper.acceptedDate?.toISOString() || paper.submissionDate.toISOString(),
        modifiedTime: paper.acceptedDate?.toISOString() || paper.submissionDate.toISOString(),
        authors: authors.map((author: any) => author.fullName),
        tags: keywords,
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: paper.title,
        description,
        creator: '@JEDSD',
        site: '@JEDSD',
      },
      other: {
        // === GOOGLE SCHOLAR / HIGHWIRE PRESS META TAGS ===
        // Each citation_author must be a separate <meta> tag — Scholar ignores comma lists
        ...authorMetaTags,
        ...affiliationTags,
        'citation_title': paper.title,
        'citation_publication_date': publicationDate,
        'citation_journal_title': 'JEDSD - Journal of Embedded and Digital System Design',
        'citation_journal_abbreviation': 'JEDSD',
        'citation_issn': '2582-0605',
        'citation_volume': volumeStr,
        'citation_issue': issueStr,
        'citation_firstpage': pageStartStr,
        // citation_pdf_url is the #1 most important tag for Google Scholar full-text
        'citation_pdf_url': paper.filePath
          ? paper.filePath.startsWith('http')
            ? paper.filePath
            : `${baseUrl}${paper.filePath}`
          : '',
        // DOI must be just the identifier (e.g. 10.5281/zenodo.12345), NOT a URL
        ...(doiIdentifier && { 'citation_doi': doiIdentifier }),
        'citation_abstract_html_url': canonicalUrl,
        'citation_language': 'en',
        'citation_keywords': keywords.join('; '),
        'citation_online_date': publicationDate,
        'citation_publisher': 'JEDSD',
        'citation_fulltext_html_url': canonicalUrl,

        // === DUBLIN CORE TAGS ===
        'DC.title': paper.title,
        'DC.creator': firstAuthor,
        'DC.subject': keywords.join('; '),
        'DC.description': description,
        'DC.publisher': 'JEDSD - Journal of Embedded and Digital System Design',
        'DC.contributor': authors.map((a: any) => a.fullName).join('; '),
        'DC.date': publicationDate,
        'DC.type': 'Text.Journal.Article',
        'DC.format': 'application/pdf',
        'DC.identifier': doiIdentifier || canonicalUrl,
        'DC.identifier.URI': canonicalUrl,
        'DC.language': 'en',
        'DC.issued': publicationDate,

        // === PRISM TAGS ===
        'prism.publicationName': 'Journal of Embedded and Digital System Design',
        'prism.publicationDate': publicationDate,
        'prism.volume': volumeStr,
        'prism.number': issueStr,
        'prism.section': 'Research Article',
        'prism.startingPage': pageStartStr,
        'prism.issn': '2582-0605',
        ...(doiIdentifier && { 'prism.doi': doiIdentifier }),
        'prism.url': canonicalUrl,

        // === OG ARTICLE TAGS ===
        'article:published_time': paper.acceptedDate?.toISOString() || paper.submissionDate.toISOString(),
        'article:modified_time': paper.acceptedDate?.toISOString() || paper.submissionDate.toISOString(),
        'article:author': firstAuthor,
        'article:section': 'Research Article',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'JEDSD - Research Paper',
      description: 'View research paper details',
      robots: { index: false, follow: false },
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
    // Use direct Prisma query — avoids HTTP round-trip that fails when NEXTAUTH_URL
    // is set to localhost (which is common in misconfigured production environments)
    const dbPaper = await prisma.researchPaper.findFirst({
      where: {
        OR: [{ paperId: id }, { id }],
      },
      include: {
        author: { select: { id: true, name: true, email: true, userType: true } },
        reviews: {
          select: {
            id: true,
            reviewerId: true,
            // NOTE: reviewText (editor-only) is intentionally excluded here
            reviewTextForAuthor: true,
            rating: true,
            reviewerStatus: true,
            correspondingFile: true,
            createdAt: true,
            updatedAt: true,
            reviewer: {
              select: { id: true, name: true, email: true, affiliation: true },
            },
          },
        },
      },
    });

    if (!dbPaper) {
      notFound();
    }

    // Serialize Dates to strings to match the ResearchPaper interface
    paper = {
      ...dbPaper,
      submissionDate: dbPaper.submissionDate.toISOString(),
      acceptedDate: dbPaper.acceptedDate?.toISOString(),
    } as unknown as ResearchPaper;

    // Parse JSON fields
    if (dbPaper.contributors) {
      try {
        const contributorsData =
          typeof dbPaper.contributors === "string"
            ? JSON.parse(dbPaper.contributors as string)
            : dbPaper.contributors;
        contributors = Array.isArray(contributorsData) ? contributorsData : [];
      } catch (e) {
        console.error("Error parsing contributors:", e);
      }
    }

    if (dbPaper.pointOfContact) {
      try {
        const pocData =
          typeof dbPaper.pointOfContact === "string"
            ? JSON.parse(dbPaper.pointOfContact as string)
            : dbPaper.pointOfContact;
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

  // Generate comprehensive JSON-LD structured data for Google Scholar and search engines
  const baseUrl = process.env.NEXTAUTH_URL || 'https://jedsd.com';
  const publicationDate = new Date(paper.acceptedDate || paper.submissionDate);
  const year = publicationDate.getFullYear().toString();
  const month = (publicationDate.getMonth() + 1).toString().padStart(2, '0');
  const day = publicationDate.getDate().toString().padStart(2, '0');
  const isoDate = `${year}-${month}-${day}`;

  // paper.doi is stored as a full URL (e.g. https://doi.org/10.5281/…) — use directly
  const doiUrl = paper.doi
    ? (paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`)
    : null;
  // Just the identifier portion for structured data "value" fields
  const doiIdentifier = paper.doi
    ? paper.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    : null;

  // Use stored volume/issue numbers from DB; fall back to year/month
  const launchYear = 2025;
  const pubYear = publicationDate.getFullYear();
  const volumeStr = String(pubYear - launchYear + 1); // Vol 1 = 2025, Vol 2 = 2026 …
  const issueStr = month;                              // month as issue proxy for now
  const pageStartStr = '1';
  const pageEndStr = '';                               // unknown until set manually
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    // @id must be the canonical URL or the DOI URL — paper.doi is already a full URL
    '@id': doiUrl || `${baseUrl}/paper/${paper.paperId}`,
    headline: paper.title,
    name: paper.title,
    abstract: paper.abstract,
    description: paper.abstract,
    alternativeHeadline: paper.title,
    author: contributors.length > 0 ? contributors.map((author: any) => ({
      '@type': 'Person',
      name: author.fullName,
      email: author.email,
      givenName: author.fullName?.split(' ')[0],
      familyName: author.fullName?.split(' ').slice(1).join(' '),
      affiliation: author.affiliation ? {
        '@type': 'Organization',
        name: author.affiliation,
      } : undefined,
      url: author.email ? `mailto:${author.email}` : undefined,
    })) : [{
      '@type': 'Person',
      name: paper.author?.name || 'Unknown Author',
    }],
    editor: contributors.length > 0 ? {
      '@type': 'Person',
      name: 'Editorial Team',
    } : undefined,
    datePublished: isoDate,
    dateCreated: new Date(paper.submissionDate).toISOString().split('T')[0],
    dateModified: isoDate,
    inLanguage: 'en',
    language: 'en',
    keywords: Array.isArray(paper.keywords) ? paper.keywords.join(', ') : paper.keywords,
    about: Array.isArray(paper.keywords) ? paper.keywords.map(k => ({
      '@type': 'Thing',
      name: k,
    })) : [],
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'PublicationIssue',
      name: `Volume ${volumeStr}, Issue ${issueStr}`,
      datePublished: isoDate,
      isPartOf: {
        '@type': 'Periodical',
        name: 'JEDSD - Journal of Embedded and Digital System Design',
        issn: '2582-0605',
        volumeNumber: volumeStr,
        issueNumber: issueStr,
      },
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    copyrightYear: year,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'JEDSD - Journal of Embedded and Digital System Design',
    },
    publisher: {
      '@type': 'Organization',
      name: 'JEDSD - Journal of Embedded and Digital System Design',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logored.jpg`,
        width: 250,
        height: 60,
      },
      sameAs: [baseUrl],
    },
    url: `${baseUrl}/paper/${paper.paperId}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/paper/${paper.paperId}`,
    },
    pageStart: pageStartStr,
    spatialCoverage: {
      '@type': 'Place',
      name: 'Global',
    },
    ...(doiUrl && doiIdentifier && {
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'DOI',
        // value = just the identifier portion (e.g. 10.5281/zenodo.12345)
        value: doiIdentifier,
        // url = full resolvable DOI link
        url: doiUrl,
      },
      sameAs: [
        doiUrl,
        `${baseUrl}/paper/${paper.paperId}`,
      ],
      doi: doiIdentifier,
    }),
    ...(paper.filePath && { 
      hasVersion: {
        '@type': 'Thing',
        name: 'Full Text PDF',
      },
      encoding: {
        '@type': 'MediaObject',
        contentUrl: paper.filePath.startsWith('http') ? paper.filePath : `${baseUrl}${paper.filePath}`,
        encodingFormat: 'application/pdf',
        name: `${paper.title} - Full Text PDF`,
        description: 'PDF version of the published research paper',
      },
      associatedMedia: {
        '@type': 'MediaObject',
        contentUrl: paper.filePath.startsWith('http') ? paper.filePath : `${baseUrl}${paper.filePath}`,
        encodingFormat: 'application/pdf',
      },
    }),
    hasPart: [],
    mentions: contributors.length > 0 ? contributors.map((a: any) => ({
      '@type': 'Person',
      name: a.fullName,
    })) : [],
    citation: contributors.length > 0 ? {
      '@type': 'CreativeWork',
      text: `${contributors.map((a: any) => a.fullName).join(', ')}. "${paper.title}." JEDSD - Journal of Embedded and Digital System Design, Volume ${volumeStr}, Issue ${issueStr}, ${isoDate}${doiUrl ? `, ${doiUrl}` : ''}.`,
    } : undefined,
    scholarlyArticle: {
      '@type': 'ScholarlyArticle',
    },
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
