/**
 * /archive — server-rendered list of every published paper.
 *
 * Purpose: gives crawlers (Google, Google Scholar) a static HTML page with
 * real <a> links to every paper detail page. The interactive /paper page is
 * "use client" and fetches papers after hydration, so crawlers may miss links.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';

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

function formatDate(d: Date | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ArchivePage() {
  const papers = await prisma.researchPaper.findMany({
    where: { status: { in: ['PUBLISH', 'PUBLISHED'] } },
    select: {
      paperId: true,
      title: true,
      abstract: true,
      keywords: true,
      acceptedDate: true,
      submissionDate: true,
      doi: true,
      contributors: true,
      author: { select: { name: true } },
    },
    orderBy: { acceptedDate: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Published Papers Archive</h1>
        <p className="text-muted-foreground">
          {papers.length} peer-reviewed paper{papers.length !== 1 ? 's' : ''} published in JEDSD.
        </p>
      </header>

      <ol className="space-y-8 list-none">
        {papers.map((paper) => {
          const contributors = parseContributors(paper.contributors);
          const authorNames =
            contributors.length > 0
              ? contributors.map((c) => c.fullName).join(', ')
              : paper.author?.name ?? 'Unknown Author';
          const pubDate = paper.acceptedDate ?? paper.submissionDate;

          return (
            <li
              key={paper.paperId}
              className="border-b pb-8 last:border-0"
            >
              {/* Title — the crawlable link */}
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
    </div>
  );
}
