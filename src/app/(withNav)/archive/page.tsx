/**
 * /archive — server-rendered list of every published paper.
 *
 * Filtering by volume and/or issue is done via URL search params so the page
 * stays fully crawlable (no client-side JS required for the filtered views).
 *
 * ?volume=1          → papers in volume 1
 * ?issue=2           → papers in issue 2
 * ?volume=1&issue=2  → papers in volume 1, issue 2
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, BookOpen, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Archive | JEDSD',
  description:
    'Complete archive of peer-reviewed research papers published in the Journal of Embedded and Digital System Design (JEDSD).',
  alternates: { canonical: `${SITE_URL}/archive` },
};

// Revalidate once per hour — no need to be real-time for an archive page
export const revalidate = 3600;

interface Contributor {
  fullName: string;
  affiliation?: string;
}

function parseContributors(raw: unknown): Contributor[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface PageProps {
  searchParams: Promise<{ volume?: string; issue?: string }>;
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const { volume: volumeParam, issue: issueParam } = await searchParams;

  const volumeFilter = volumeParam ? parseInt(volumeParam, 10) : null;
  const issueFilter  = issueParam  ? parseInt(issueParam,  10) : null;

  // ── Build DB where clause ──────────────────────────────────────────────────
  const where: Record<string, unknown> = {
    status: { in: ['PUBLISH', 'PUBLISHED'] },
  };
  if (volumeFilter !== null && !isNaN(volumeFilter)) where.volume      = volumeFilter;
  if (issueFilter  !== null && !isNaN(issueFilter))  where.issueNumber = issueFilter;

  // ── Fetch filtered papers ──────────────────────────────────────────────────
  const papers = await prisma.researchPaper.findMany({
    where,
    select: {
      paperId:       true,
      title:         true,
      abstract:      true,
      keywords:      true,
      acceptedDate:  true,
      publishedDate: true,
      submissionDate:true,
      doi:           true,
      volume:        true,
      issueNumber:   true,
      contributors:  true,
      author: { select: { name: true } },
    },
    orderBy: [
      { volume:      'desc' },
      { issueNumber: 'desc' },
      { acceptedDate:'desc' },
    ],
  });

  // ── Collect distinct volumes & issues for the filter sidebar ───────────────
  const allPapers = await prisma.researchPaper.findMany({
    where: { status: { in: ['PUBLISH', 'PUBLISHED'] } },
    select: { volume: true, issueNumber: true },
  });

  const volumes = Array.from(
    new Set(allPapers.map((p) => p.volume).filter((v): v is number => v !== null))
  ).sort((a, b) => b - a);

  const issues = Array.from(
    new Set(allPapers.map((p) => p.issueNumber).filter((i): i is number => i !== null))
  ).sort((a, b) => a - b);

  const isFiltered = volumeFilter !== null || issueFilter !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-gradient-to-b from-background to-muted/20 min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Archive</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Research Archive</h1>
        <p className="text-lg text-muted-foreground">
          {papers.length} peer-reviewed paper{papers.length !== 1 ? 's' : ''}
          {isFiltered ? ' matching your filter' : ' published in JEDSD'}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-4 space-y-6">

            {/* Volume filter */}
            {volumes.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Volume
                </h2>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href={issueFilter ? `/archive?issue=${issueFilter}` : '/archive'}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                        volumeFilter === null ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      All volumes
                    </Link>
                  </li>
                  {volumes.map((vol) => {
                    const href = issueFilter
                      ? `/archive?volume=${vol}&issue=${issueFilter}`
                      : `/archive?volume=${vol}`;
                    return (
                      <li key={vol}>
                        <Link
                          href={href}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                            volumeFilter === vol
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span>Vol. {vol}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Issue filter */}
            {issues.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Issue
                </h2>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href={volumeFilter ? `/archive?volume=${volumeFilter}` : '/archive'}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                        issueFilter === null ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      All issues
                    </Link>
                  </li>
                  {issues.map((iss) => {
                    const href = volumeFilter
                      ? `/archive?volume=${volumeFilter}&issue=${iss}`
                      : `/archive?issue=${iss}`;
                    return (
                      <li key={iss}>
                        <Link
                          href={href}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                            issueFilter === iss
                              ? 'bg-primary/10 font-semibold text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span>No. {iss}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Clear filter */}
            {isFiltered && (
              <Link
                href="/archive"
                className="block text-center rounded-lg border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted"
              >
                Clear filter
              </Link>
            )}
          </div>
        </aside>

        {/* ── Paper list ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No papers found{isFiltered ? ' for the selected filter' : ''}.
              </p>
              {isFiltered && (
                <Link href="/archive" className="mt-3 text-xs underline underline-offset-2 text-primary">
                  View all papers
                </Link>
              )}
            </div>
          ) : (
            <ol className="space-y-8 list-none">
              {papers.map((paper) => {
                const contributors = parseContributors(paper.contributors);
                const authorNames =
                  contributors.length > 0
                    ? contributors.map((c) => c.fullName).join(', ')
                    : paper.author?.name ?? 'Unknown Author';
                const pubDate = paper.publishedDate ?? paper.acceptedDate ?? paper.submissionDate;

                return (
                  <li key={paper.paperId} className="border-b pb-8 last:border-0">

                    {/* Volume / Issue badge */}
                    {(paper.volume != null || paper.issueNumber != null) && (
                      <div className="flex items-center gap-2 mb-2">
                        {paper.volume != null && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">
                            Vol. {paper.volume}
                          </Badge>
                        )}
                        {paper.issueNumber != null && (
                          <Badge variant="outline" className="text-[10px] rounded-full">
                            No. {paper.issueNumber}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <Link
                      href={`/paper/${paper.paperId}`}
                      className="text-xl font-semibold hover:text-primary hover:underline leading-snug block mb-2"
                    >
                      {paper.title}
                    </Link>

                    {/* Authors */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                      <User className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{authorNames}</span>
                    </div>

                    {/* Date + DOI */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      {pubDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(pubDate)}
                        </span>
                      )}
                      {paper.doi && (
                        <a
                          href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono hover:text-primary hover:underline"
                        >
                          {paper.doi}
                        </a>
                      )}
                    </div>

                    {/* Abstract snippet */}
                    {paper.abstract && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                        {paper.abstract}
                      </p>
                    )}

                    {/* Keywords */}
                    {paper.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        {paper.keywords.slice(0, 8).map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs rounded-full">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
