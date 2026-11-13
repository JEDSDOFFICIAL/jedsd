/**
 * /publications — Main landing page for the publication archive
 * Displays all volumes with their statistics
 */

import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { JOURNAL } from "@/lib/journal-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, Calendar, ArrowRight, Library } from "lucide-react";

export const metadata: Metadata = {
  title: `Publications Archive | ${JOURNAL.shortName}`,
  description: `Complete archive of peer-reviewed research papers published in ${JOURNAL.title}. Browse by volume and issue.`,
  alternates: { canonical: `${SITE_URL}/publications` },
};

export const revalidate = 3600; // Revalidate once per hour

interface VolumeWithStats {
  volume: number;
  year: number;
  issueCount: number;
  articleCount: number;
  latestPublicationDate: Date | null;
}

async function getVolumesWithStats(): Promise<VolumeWithStats[]> {
  const papers = await prisma.researchPaper.findMany({
    where: {
      status: { in: ["PUBLISH", "PUBLISHED"] },
      volume: { not: null },
    },
    select: {
      volume: true,
      issueNumber: true,
      publishedDate: true,
      acceptedDate: true,
    },
  });

  const volumeMap = new Map<number, VolumeWithStats>();

  papers.forEach((paper) => {
    if (paper.volume === null) return;

    const pubDate = paper.publishedDate ?? paper.acceptedDate;
    const existing = volumeMap.get(paper.volume);

    if (!existing) {
      volumeMap.set(paper.volume, {
        volume: paper.volume,
        year: pubDate ? new Date(pubDate).getFullYear() : new Date().getFullYear(),
        issueCount: paper.issueNumber ? 1 : 0,
        articleCount: 1,
        latestPublicationDate: pubDate,
      });
    } else {
      existing.articleCount++;
      if (paper.issueNumber) {
        existing.issueCount = Math.max(existing.issueCount, paper.issueNumber);
      }
      if (
        pubDate &&
        (!existing.latestPublicationDate || pubDate > existing.latestPublicationDate)
      ) {
        existing.latestPublicationDate = pubDate;
      }
    }
  });

  return Array.from(volumeMap.values()).sort((a, b) => b.volume - a.volume);
}

function VolumeCard({ stats }: { stats: VolumeWithStats }) {
  return (
    <Link href={`/publications/volume/${stats.volume}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                Volume {stats.volume}
              </CardTitle>
              <p className="text-base text-muted-foreground">Year {stats.year}</p>
            </div>
            <div className="p-2 rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.articleCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Articles
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.issueCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {stats.issueCount === 1 ? "Issue" : "Issues"}
              </p>
            </div>
          </div>

          {/* Latest Publication Date */}
          {stats.latestPublicationDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Calendar className="h-4 w-4" />
              <span>
                Latest:{" "}
                {new Date(stats.latestPublicationDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Action */}
          <div className="flex items-center gap-2 text-primary font-medium text-sm pt-2 group-hover:gap-3 transition-all">
            <span>Explore Volume</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function PublicationsPage() {
  const volumes = await getVolumesWithStats();
  const totalArticles = volumes.reduce((sum, v) => sum + v.articleCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Library className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Publications Archive
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore {totalArticles} peer-reviewed research papers published across{" "}
            {volumes.length} {volumes.length === 1 ? "volume" : "volumes"} in{" "}
            {JOURNAL.title}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">{volumes.length}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Volumes Published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">{totalArticles}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Research Articles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-primary mb-2">
                {volumes.reduce((sum, v) => sum + v.issueCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Issues Published
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Volumes Grid */}
        {volumes.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Browse by Volume</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volumes.map((stats) => (
                <VolumeCard key={stats.volume} stats={stats} />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No publications available yet. Check back soon for our latest research.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Alternative Browse Option */}
        {volumes.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Looking for something specific?
            </p>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <FileText className="h-4 w-4" />
              Browse all articles with filters
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
