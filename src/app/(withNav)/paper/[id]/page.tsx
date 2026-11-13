import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { cleanText } from "@/lib/text";
import {
  Calendar,
  User,
  Tag,
  FileText,
  ExternalLink,
  Eye,
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
import PaperBreadcrumb from "@/components/paper/PaperBreadcrumb";
import CitationActions from "@/components/paper/CitationActions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contributor {
  fullName: string;
  email?: string;
  affiliation?: string;
  contactNumber?: string;
}

interface ResearchPaper {
  id: string;
  paperId: string;
  doi?: string | null;
  title: string;
  abstract: string;
  keywords: string[];
  submissionDate: string;
  acceptedDate?: string | null;
  status: string;
  filePath: string;
  coverLetterPath?: string | null;
  rating?: number | null;
  volume?: number | null;
  issueNumber?: number | null;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  contributors?: Contributor[];
  pointOfContact?: Contributor | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PUBLISHED_STATUSES = ['PUBLISH', 'PUBLISHED'] as const;
type PublishedStatus = typeof PUBLISHED_STATUSES[number];

function isPublishedStatus(s: string): s is PublishedStatus {
  return PUBLISHED_STATUSES.includes(s as PublishedStatus);
}

/** Parse contributors JSON field safely. */
function parseContributors(raw: unknown): Contributor[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Return YYYY/MM/DD — the format Google Scholar expects. */
function toScholarDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${dd}`;
}

/** Return YYYY-MM-DD for ISO / JSON-LD dates. */
function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Strip https://doi.org/ (or http://dx.doi.org/) prefix → bare identifier. */
function bareDoiId(doi: string): string {
  return doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
}

/** Ensure DOI is a full HTTPS URL. */
function fullDoiUrl(doi: string): string {
  if (doi.startsWith('http')) return doi;
  return `https://doi.org/${doi}`;
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Lookup — match either human-readable paperId or internal UUID
  let paper: Awaited<ReturnType<typeof prisma.researchPaper.findFirst<{ include: { author: { select: { id: true; name: true; email: true } } } }>>>;
  try {
    paper = await prisma.researchPaper.findFirst({
      where: { OR: [{ paperId: id }, { id }] },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  } catch (err) {
    // Rethrow so Next.js surfaces a 500 rather than silently noindex-ing
    throw err;
  }

  if (!paper) {
    return {
      title: 'Paper Not Found — JEDSD',
      description: 'The requested research paper does not exist.',
      robots: { index: false, follow: false },
    };
  }

  const isPublished = isPublishedStatus(paper.status);
  const contributors = parseContributors(paper.contributors);
  const firstAuthor =
    contributors[0]?.fullName ?? paper.author?.name ?? 'Unknown Author';

  // Clean text artefacts from abstract
  const cleanAbstract = cleanText(paper.abstract);
  const description =
    cleanAbstract.length > 160
      ? cleanAbstract.slice(0, 157) + '...'
      : cleanAbstract;

  // Keywords — clean each one
  const keywords: string[] = (
    Array.isArray(paper.keywords)
      ? paper.keywords
      : typeof paper.keywords === 'string'
      ? (paper.keywords as string).split(',')
      : []
  ).map((k) => cleanText(k)).filter(Boolean);

  const canonicalUrl = `${SITE_URL}/paper/${paper.paperId}`;

  const pubDate = new Date(paper.acceptedDate ?? paper.submissionDate);
  const scholarDate = toScholarDate(pubDate); // YYYY/MM/DD

  // DOI
  const doiIdentifier = paper.doi ? bareDoiId(paper.doi) : '';

  // PDF proxy URL — always same-host so Scholar can find it
  const proxyPdfUrl = paper.filePath
    ? `${SITE_URL}/api/pdf/${encodeURIComponent(paper.paperId)}.pdf`
    : null;

  // ── Build citation_author / citation_author_institution arrays ──────────────
  // Next.js `other` accepts string | string[] values.
  // Passing an array causes Next.js to render one <meta> tag per element.
  const citationAuthors: string[] =
    contributors.length > 0
      ? contributors.map((a) => a.fullName)
      : [paper.author?.name ?? 'Unknown Author'];

  const citationInstitutions: string[] = contributors
    .map((a) => a.affiliation ?? '')
    .filter(Boolean);

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
    authors: contributors.map((a) => ({ name: a.fullName })),
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
      publishedTime: paper.acceptedDate?.toISOString() ?? paper.submissionDate.toISOString(),
      modifiedTime: paper.acceptedDate?.toISOString() ?? paper.submissionDate.toISOString(),
      authors: contributors.map((a) => a.fullName),
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
      // ── Google Scholar / Highwire Press ──────────────────────────────────
      // Arrays → one <meta name="…"> per element (Next.js App Router behaviour)
      citation_title: paper.title,
      citation_author: citationAuthors,
      ...(citationInstitutions.length > 0 && {
        citation_author_institution: citationInstitutions,
      }),
      citation_journal_title:
        'JEDSD - Journal of Embedded and Digital System Design',
      citation_journal_abbreviation: 'JEDSD',
      citation_issn: '2582-0605',
      citation_publication_date: scholarDate,
      citation_online_date: scholarDate,
      // citation_pdf_url is the single most important tag for Scholar full-text
      ...(proxyPdfUrl && { citation_pdf_url: proxyPdfUrl }),
      ...(doiIdentifier && { citation_doi: doiIdentifier }),
      citation_abstract_html_url: canonicalUrl,
      citation_fulltext_html_url: canonicalUrl,
      citation_language: 'en',
      citation_publisher: 'JEDSD',
      ...(keywords.length > 0 && {
        citation_keywords: keywords.join('; '),
      }),

      // ── Dublin Core ──────────────────────────────────────────────────────
      'DC.title': paper.title,
      'DC.creator': firstAuthor,
      ...(keywords.length > 0 && { 'DC.subject': keywords.join('; ') }),
      'DC.description': description,
      'DC.publisher': 'JEDSD - Journal of Embedded and Digital System Design',
      'DC.date': toIsoDate(pubDate),
      'DC.type': 'Text.Journal.Article',
      'DC.format': 'application/pdf',
      'DC.identifier': doiIdentifier || canonicalUrl,
      'DC.identifier.URI': canonicalUrl,
      'DC.language': 'en',
      'DC.issued': toIsoDate(pubDate),

      // ── PRISM ────────────────────────────────────────────────────────────
      'prism.publicationName':
        'Journal of Embedded and Digital System Design',
      'prism.publicationDate': toIsoDate(pubDate),
      'prism.section': 'Research Article',
      'prism.issn': '2582-0605',
      ...(doiIdentifier && { 'prism.doi': doiIdentifier }),
      'prism.url': canonicalUrl,
    },
  };
}

// ─── Page component ───────────────────────────────────────────────────────────

export default async function PaperDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ── Fetch from DB ──────────────────────────────────────────────────────────
  const dbPaper = await prisma.researchPaper.findFirst({
    where: { OR: [{ paperId: id }, { id }] },
    include: {
      author: { select: { id: true, name: true, email: true, userType: true } },
      // reviews excluded — PaperDetailsClient doesn't use them and
      // reviewer emails/names must not be exposed to public clients
    },
  });

  if (!dbPaper) notFound();

  // ── Access control ─────────────────────────────────────────────────────────
  // Public visitors only see PUBLISH / PUBLISHED papers.
  // The paper's owner, ADMIN, and EDITOR may view any status.
  if (!isPublishedStatus(dbPaper.status)) {
    const session = await getServerSession(authOptions);
    const role = session?.user?.variableUserType;
    const isOwner = session?.user?.id === dbPaper.authorId;
    const isPrivileged = role === 'ADMIN' || role === 'EDITOR';

    if (!isOwner && !isPrivileged) {
      notFound();
    }
  }

  // ── Serialize dates ────────────────────────────────────────────────────────
  const paper: ResearchPaper = {
    ...dbPaper,
    submissionDate: dbPaper.submissionDate.toISOString(),
    acceptedDate: dbPaper.acceptedDate?.toISOString() ?? null,
  } as unknown as ResearchPaper;

  // ── Parse JSON fields ──────────────────────────────────────────────────────
  const contributors = parseContributors(dbPaper.contributors);

  let pointOfContact: Contributor | null = null;
  if (dbPaper.pointOfContact) {
    try {
      const raw =
        typeof dbPaper.pointOfContact === 'string'
          ? JSON.parse(dbPaper.pointOfContact as string)
          : dbPaper.pointOfContact;
      pointOfContact = raw as Contributor;
    } catch {
      // ignore malformed JSON
    }
  }

  // ── Date / DOI helpers ─────────────────────────────────────────────────────
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const pubDate = new Date(paper.acceptedDate ?? paper.submissionDate);
  const isoDate = toIsoDate(pubDate);

  const doiUrl = paper.doi ? fullDoiUrl(paper.doi) : null;
  const doiIdentifier = paper.doi ? bareDoiId(paper.doi) : null;

  // PDF proxy URL for JSON-LD encoding (same host as abstract page)
  const proxyPdfUrl = paper.filePath
    ? `${SITE_URL}/api/pdf/${encodeURIComponent(paper.paperId)}.pdf`
    : null;

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': doiUrl ?? `${SITE_URL}/paper/${paper.paperId}`,
    headline: paper.title,
    name: paper.title,
    abstract: cleanText(paper.abstract),
    description: cleanText(paper.abstract),
    datePublished: isoDate,
    dateCreated: toIsoDate(new Date(paper.submissionDate)),
    dateModified: isoDate,
    inLanguage: 'en',
    isAccessibleForFree: true,
    ...(paper.keywords?.length > 0 && {
      keywords: paper.keywords.map(cleanText).join(', '),
      about: paper.keywords.map((k) => ({ '@type': 'Thing', name: cleanText(k) })),
    }),
    author:
      contributors.length > 0
        ? contributors.map((a) => ({
            '@type': 'Person',
            name: a.fullName,
            givenName: a.fullName.split(' ')[0],
            familyName: a.fullName.split(' ').slice(1).join(' '),
            ...(a.affiliation && {
              affiliation: { '@type': 'Organization', name: a.affiliation },
            }),
          }))
        : [{ '@type': 'Person', name: paper.author?.name ?? 'Unknown Author' }],
    isPartOf: {
      '@type': 'Periodical',
      name: 'JEDSD - Journal of Embedded and Digital System Design',
      issn: '2582-0605',
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    copyrightYear: pubDate.getFullYear(),
    copyrightHolder: {
      '@type': 'Organization',
      name: 'JEDSD - Journal of Embedded and Digital System Design',
    },
    publisher: {
      '@type': 'Organization',
      name: 'JEDSD - Journal of Embedded and Digital System Design',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logored.jpg`,
        width: 250,
        height: 60,
      },
    },
    url: `${SITE_URL}/paper/${paper.paperId}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/paper/${paper.paperId}`,
    },
    ...(doiUrl &&
      doiIdentifier && {
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'DOI',
          value: doiIdentifier,
          url: doiUrl,
        },
        sameAs: [doiUrl, `${SITE_URL}/paper/${paper.paperId}`],
        doi: doiIdentifier,
      }),
    ...(proxyPdfUrl && {
      encoding: {
        '@type': 'MediaObject',
        contentUrl: proxyPdfUrl,
        encodingFormat: 'application/pdf',
        name: `${paper.title} — Full Text PDF`,
      },
    }),
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full min-h-screen overflow-x-hidden scroll-smooth bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 w-full max-w-7xl">
          {/* Breadcrumb */}
          <div className="pt-6">
            <PaperBreadcrumb
              volume={paper.volume}
              issueNumber={paper.issueNumber}
              paperId={paper.paperId}
              title={paper.title}
            />
          </div>

          {/* Header */}
          <div className="my-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Publication Info Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {paper.volume && (
                    <Badge variant="secondary" className="text-xs">
                      Volume {paper.volume}
                    </Badge>
                  )}
                  {paper.issueNumber && (
                    <Badge variant="outline" className="text-xs">
                      Issue {paper.issueNumber}
                    </Badge>
                  )}
                  <Badge
                    variant={isPublishedStatus(paper.status) ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {paper.status}
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {paper.title}
                </h1>

                {/* Paper Meta Info */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {paper.acceptedDate && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Published: {formatDate(paper.acceptedDate)}</span>
                    </div>
                  )}
                  {!paper.acceptedDate && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {formatDate(paper.submissionDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Authors */}
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
                    {cleanText(paper.abstract)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild size="lg">
                    <Link href={paper.filePath} target="_blank">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Paper
                    </Link>
                  </Button>

                  <PaperDetailsClient paper={paper} />

                  {/* Citation Button */}
                  {isPublishedStatus(paper.status) && paper.acceptedDate && (
                    <CitationActions
                      title={paper.title}
                      authors={
                        contributors.length > 0
                          ? contributors.map((c) => c.fullName).join(", ")
                          : paper.author?.name ?? "Unknown Author"
                      }
                      year={pubDate.getFullYear()}
                      journal="JEDSD - Journal of Embedded and Digital System Design"
                      volume={paper.volume}
                      issue={paper.issueNumber}
                      doi={doiIdentifier ?? undefined}
                      url={`${SITE_URL}/paper/${paper.paperId}`}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Paper Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Publication Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Journal */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground">Journal</Label>
                    <p className="text-sm font-medium">
                      Journal of Embedded & Digital System Design
                    </p>
                    <p className="text-xs text-muted-foreground">ISSN: 2582-0605</p>
                  </div>

                  <Separator />

                  {/* Volume & Issue */}
                  {(paper.volume || paper.issueNumber) && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {paper.volume && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-muted-foreground">Volume</Label>
                            <p className="text-lg font-bold">{paper.volume}</p>
                          </div>
                        )}
                        {paper.issueNumber && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-muted-foreground">Issue</Label>
                            <p className="text-lg font-bold">{paper.issueNumber}</p>
                          </div>
                        )}
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* DOI */}
                  {paper.doi && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">DOI</Label>
                        <Link
                          href={doiUrl ?? paper.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-mono hover:underline break-all block"
                        >
                          {paper.doi}
                        </Link>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Dates */}
                  <div className="space-y-3">
                    {paper.acceptedDate && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Published
                        </Label>
                        <p className="text-sm">
                          {formatDate(paper.acceptedDate)}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Submitted
                      </Label>
                      <p className="text-sm">
                        {formatDate(paper.submissionDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Point of Contact */}
              {pointOfContact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Corresponding Author</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{pointOfContact.fullName}</p>
                    {pointOfContact.affiliation && (
                      <p className="text-sm text-muted-foreground">
                        {pointOfContact.affiliation}
                      </p>
                    )}
                    {pointOfContact.email && (
                      <a
                        href={`mailto:${pointOfContact.email}`}
                        className="text-sm text-primary hover:underline block"
                      >
                        {pointOfContact.email}
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Keywords */}
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
                      {cleanText(keyword)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PDF Preview */}
          {paper.filePath && (
            <Card className="w-full my-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="h-5 w-5" />
                  Paper Preview
                </CardTitle>
                <CardDescription>
                  Viewing first 3 pages — open full paper to see all pages
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
