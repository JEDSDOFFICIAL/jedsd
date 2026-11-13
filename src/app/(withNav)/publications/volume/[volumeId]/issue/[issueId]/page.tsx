/**
 * /publications/volume/[volumeId]/issue/[issueId] — Issue details page
 * Shows all articles in a specific issue
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { JOURNAL } from "@/lib/journal-info";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  ChevronLeft,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";

interface PageProps {
  params: Promise<{ volumeId: string; issueId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { volumeId, issueId } = await params;
  const volume = parseInt(volumeId, 10);
  const issue = parseInt(issueId, 10);

  if (isNaN(volume) || isNaN(issue)) {
    return {
      title: "Issue Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Volume ${volume}, Issue ${issue} | Publications | ${JOURNAL.shortName}`,
    description: `Browse all research articles published in Volume ${volume}, Issue ${issue} of ${JOURNAL.title}.`,
    alternates: {
      canonical: `${SITE_URL}/publications/volume/${volume}/issue/${issue}`,
    },
  };
}

export const revalidate = 3600;

interface Contributor {
  fullName: string;
  affiliation?: string;
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

export default async function IssueDetailPage({ params }: PageProps) {
  const { volumeId, issueId } = await params;
  const volume = parseInt(volumeId, 10);
  const issue = parseInt(issueId, 10);

  if (isNaN(volume) || isNaN(issue)) {
    notFound();
  }

  // Fetch all papers in this volume and issue
  const papers = await prisma.researchPaper.findMany({
    where: {
      status: { in: ["PUBLISH", "PUBLISHED"] },
      volume,
      issueNumber: issue,
    },
    select: {
      paperId: true,
      title: true,
      abstract: true,
      keywords: true,
      publishedDate: true,
      acceptedDate: true,
      doi: true,
      filePath: true,
      contributors: true,
      author: { select: { name: true } },
    },
    orderBy: [
      { publishedDate: "desc" },
      { acceptedDate: "desc" },
    ],
  });

  if (papers.length === 0) {
    notFound();
  }

  const year =
    papers[0]?.publishedDate ?? papers[0]?.acceptedDate
      ? new Date(
          (papers[0].publishedDate ?? papers[0].acceptedDate)!
        ).getFullYear()
      : new Date().getFullYear();

  const periodLabel =
    issue === 1
      ? "January – June"
      : issue === 2
      ? "July – December"
      : `Issue ${issue}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
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
            <li>
              <Link
                href={`/publications/volume/${volume}`}
                className="hover:text-primary"
              >
                Volume {volume}
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Issue {issue}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/publications/volume/${volume}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Volume {volume}
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Volume {volume}
              </Badge>
              <span className="text-muted-foreground">·</span>
              <Badge variant="default" className="text-sm">
                Issue {issue}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Volume {volume}, Issue {issue}
            </h1>
            <p className="text-xl text-muted-foreground">
              {periodLabel} {year}
            </p>
            <p className="text-base text-muted-foreground">
              {papers.length} {papers.length === 1 ? "Article" : "Articles"}{" "}
              Published
            </p>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-8">
          {papers.map((paper, index) => {
            const contributors = parseContributors(paper.contributors);
            const authorNames =
              contributors.length > 0
                ? contributors.map((c) => c.fullName).join(", ")
                : paper.author?.name ?? "Unknown Author";

            const pubDate = paper.publishedDate ?? paper.acceptedDate;

            return (
              <article
                key={paper.paperId}
                className="border-b pb-8 last:border-0"
              >
                {/* Article Number */}
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Article {index + 1}
                </div>

                {/* Title */}
                <Link href={`/paper/${paper.paperId}`}>
                  <h2 className="text-2xl font-bold hover:text-primary hover:underline mb-4 leading-tight">
                    {paper.title}
                  </h2>
                </Link>

                {/* Authors */}
                <div className="flex items-start gap-2 mb-4">
                  <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-base">{authorNames}</p>
                    {contributors.length > 0 &&
                      contributors.some((c) => c.affiliation) && (
                        <p className="text-sm text-muted-foreground">
                          {contributors
                            .filter((c) => c.affiliation)
                            .map((c) => c.affiliation)
                            .join("; ")}
                        </p>
                      )}
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {pubDate && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Published:{" "}
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
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline font-mono"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {paper.doi}
                    </a>
                  )}
                </div>

                {/* Abstract */}
                {paper.abstract && (
                  <p className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {paper.abstract}
                  </p>
                )}

                {/* Keywords */}
                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    {paper.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="default" size="sm">
                    <Link href={`/paper/${paper.paperId}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Read Article
                    </Link>
                  </Button>
                  {paper.filePath && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={paper.filePath} target="_blank">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <Link
              href={`/publications/volume/${volume}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              View all issues in Volume {volume}
            </Link>
            <Link
              href="/publications"
              className="text-muted-foreground hover:text-primary hover:underline"
            >
              Browse all volumes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
