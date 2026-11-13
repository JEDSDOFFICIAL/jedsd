import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Calendar, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

interface VolumeStats {
  volume: number;
  year: number;
  issueCount: number;
  articleCount: number;
  latestPublicationDate: Date | null;
}

async function getVolumeStats(): Promise<VolumeStats[]> {
  // Get all published papers
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

  // Group by volume
  const volumeMap = new Map<number, VolumeStats>();

  papers.forEach((paper) => {
    if (paper.volume === null) return;

    const existing = volumeMap.get(paper.volume);
    const pubDate = paper.publishedDate ?? paper.acceptedDate;

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
      if (paper.issueNumber && !volumeMap.has(paper.issueNumber)) {
        existing.issueCount = Math.max(existing.issueCount, paper.issueNumber);
      }
      if (pubDate && (!existing.latestPublicationDate || pubDate > existing.latestPublicationDate)) {
        existing.latestPublicationDate = pubDate;
      }
    }
  });

  // Convert to array and sort by volume descending
  return Array.from(volumeMap.values()).sort((a, b) => b.volume - a.volume);
}

function VolumeCard({ stats }: { stats: VolumeStats }) {
  return (
    <Link href={`/archive?volume=${stats.volume}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                Volume {stats.volume}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Year {stats.year}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.articleCount} {stats.articleCount === 1 ? "Article" : "Articles"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {stats.issueCount} {stats.issueCount === 1 ? "Issue" : "Issues"}
              </span>
            </div>
            {stats.latestPublicationDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">
                  {new Date(stats.latestPublicationDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
            <span>Explore Volume</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function PublicationArchiveSection() {
  const volumeStats = await getVolumeStats();

  if (volumeStats.length === 0) {
    return null; // Don't render section if no published papers
  }

  return (
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore Our Publications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover peer-reviewed research published in the Journal of Embedded
            & Digital System Design
          </p>
        </div>

        {/* Volume Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {volumeStats.map((stats) => (
            <VolumeCard key={stats.volume} stats={stats} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/archive">
              <BookOpen className="h-4 w-4 mr-2" />
              View Complete Archive
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
