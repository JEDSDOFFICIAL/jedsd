/**
 * /publications/volume/[volumeId] — Volume details page
 * Shows all issues and articles in a specific volume
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { JOURNAL } from "@/lib/journal-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Calendar,
  User,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

interface PageProps {
  params: Promise<{ volumeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { volumeId } = await params;
  const volume = parseInt(volumeId, 10);

  if (isNaN(volume)) {
    return {
      title: "Volume Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Volume ${volume} | Publications | ${JOURNAL.shortName}`,
    description: `Browse all research articles published in Volume ${volume} of ${JOURNAL.title}.`,
    alternates: { canonical: `${SITE_URL}/publications/volume/${volume}` },
  };
}

export const revalidate = 3600;

interface Contributor {
  fullName: string;
}

function parseContributors(raw: unknown): Contributor[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function VolumeDetailPage({ params }: PageProps) {
  const { volumeId } = await params;
  const volume = parseInt(volumeId, 10);

  if (isNaN(volume)) {
    notFound();
  }

  // Fetch all papers in this volume
  const papers = await prisma.researchPaper.findMany({
    where: {
      status: { in: ["PUBLISH", "PUBLISHED"] },
      volume,
    },
    select: {
      paperId: true,
      title: true,
      abstract: true,
      keywords: true,
      publishedDate: true,
      acceptedDate: true,
      issueNumber: true,
      doi: true,
      contributors: true,
      author: { select: { name: true } },
    },
    orderBy: [
      { issueNumber: "asc" },
      { publishedDate: "desc" },
      { acceptedDate: "desc" },
    ],
  });

  if (papers.length === 0) {
    notFound();
  }

  // Calculate stats
  const issues = Array.from(
    new Set(papers.map((p) => p.issueNumber).filter((i): i is number => i !== null))
  ).sort((a, b) => a - b);

  const year =
    papers[0]?.publishedDate ?? papers[0]?.acceptedDate
      ? new Date(
          (papers[0].publishedDate ?? papers[0].acceptedDate)!
        ).getFullYear()
      : new Date().getFullYear();

  // Group papers by issue
  const papersByIssue = new Map<number | null, typeof papers>();
  papers.forEach((paper) => {
    const issue = paper.issueNumber;
    if (!papersByIssue.has(issue)) {
      papersByIssue.set(issue, []);
    }
    papersByIssue.get(issue)!.push(paper);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/publications" className="hover:text-primary">
                Publications
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Volume {volume}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <Link
            href="/publications"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Publications
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Volume {volume}
              </h1>
              <p className="text-xl text-muted-foreground">Year {year}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-base px-4 py-2">
                {papers.length} Articles
              </Badge>
            </div>
          </div>
        </div>

        {/* Issues Summary Cards */}
        {issues.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Issues in This Volume</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issues.map((issueNum) => {
                const issuePapers = papersByIssue.get(issueNum) ?? [];
                const periodLabel =
                  issueNum === 1
                    ? "January – June"
                    : issueNum === 2
                    ? "July – December"
                    : `Issue ${issueNum}`;

                return (
                  <Link
                    key={issueNum}
                    href={`/publications/volume/${volume}/issue/${issueNum}`}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="group-hover:text-primary transition-colors">
                            Issue {issueNum}
                          </span>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {periodLabel}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{issuePapers.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Articles Published
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Articles in Volume */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Articles in Volume {volume}</h2>
          <div className="space-y-6">
            {papers.map((paper) => {
              const contributors = parseContributors(paper.contributors);
              const authorNames =
                contributors.length > 0
                  ? contributors.map((c) => c.fullName).join(", ")
                  : paper.author?.name ?? "Unknown Author";

              const pubDate = paper.publishedDate ?? paper.acceptedDate;

              return (
                <Card key={paper.paperId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Issue Badge */}
                    {paper.issueNumber && (
                      <Badge variant="outline" className="mb-3">
                        Issue {paper.issueNumber}
                      </Badge>
                    )}

                    {/* Title */}
                    <Link href={`/paper/${paper.paperId}`}>
                      <h3 className="text-xl font-semibold hover:text-primary hover:underline mb-3 leading-snug">
                        {paper.title}
                      </h3>
                    </Link>

                    {/* Authors */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <User className="h-4 w-4" />
                      <span>{authorNames}</span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      {pubDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(pubDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {paper.doi && (
                        <a
                          href={
                            paper.doi.startsWith("http")
                              ? paper.doi
                              : `https://doi.org/${paper.doi}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs hover:text-primary hover:underline"
                        >
                          {paper.doi}
                        </a>
                      )}
                    </div>

                    {/* Abstract snippet */}
                    {paper.abstract && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                        {paper.abstract}
                      </p>
                    )}

                    {/* Keywords */}
                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {paper.keywords.slice(0, 6).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                        {paper.keywords.length > 6 && (
                          <Badge variant="secondary" className="text-xs text-muted-foreground">
                            +{paper.keywords.length - 6}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
