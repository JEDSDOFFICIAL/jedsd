import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  FileText,
  ArrowRight,
  Newspaper,
} from "lucide-react";
import prisma from "@/lib/prisma";

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

async function getLatestArticles() {
  const papers = await prisma.researchPaper.findMany({
    where: {
      status: { in: ["PUBLISH", "PUBLISHED"] },
    },
    select: {
      paperId: true,
      title: true,
      abstract: true,
      keywords: true,
      publishedDate: true,
      acceptedDate: true,
      volume: true,
      issueNumber: true,
      doi: true,
      contributors: true,
      author: {
        select: { name: true },
      },
    },
    orderBy: [
      { publishedDate: "desc" },
      { acceptedDate: "desc" },
    ],
    take: 6,
  });

  return papers;
}

function ArticleCard({
  paper,
}: {
  paper: Awaited<ReturnType<typeof getLatestArticles>>[0];
}) {
  const contributors = parseContributors(paper.contributors);
  const authorNames =
    contributors.length > 0
      ? contributors.map((c) => c.fullName).join(", ")
      : paper.author?.name ?? "Unknown Author";

  const pubDate = paper.publishedDate ?? paper.acceptedDate;
  const formattedDate = pubDate
    ? new Date(pubDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Truncate abstract to 200 characters
  const abstractPreview =
    paper.abstract.length > 200
      ? paper.abstract.slice(0, 200) + "..."
      : paper.abstract;

  return (
    <Link href={`/paper/${paper.paperId}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:border-primary/50 cursor-pointer group">
        <CardContent className="p-6 space-y-4">
          {/* Volume & Issue Badges */}
          {(paper.volume || paper.issueNumber) && (
            <div className="flex items-center gap-2">
              {paper.volume && (
                <Badge variant="secondary" className="text-xs">
                  Vol. {paper.volume}
                </Badge>
              )}
              {paper.issueNumber && (
                <Badge variant="outline" className="text-xs">
                  Issue {paper.issueNumber}
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {paper.title}
          </h3>

          {/* Authors */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{authorNames}</span>
          </div>

          {/* Abstract Preview */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {abstractPreview}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-primary font-medium text-sm group-hover:gap-2 transition-all">
              <span>Read</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Keywords (first 3) */}
          {paper.keywords && paper.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {paper.keywords.slice(0, 3).map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {paper.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{paper.keywords.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function LatestArticlesSection() {
  const articles = await getLatestArticles();

  if (articles.length === 0) {
    return null; // Don't render if no published papers
  }

  return (
    <section className="w-full py-16 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Newspaper className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Latest Research Articles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recent peer-reviewed publications in embedded systems and digital
            system design
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((paper) => (
            <ArticleCard key={paper.paperId} paper={paper} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/archive">
              <FileText className="h-4 w-4 mr-2" />
              View All Publications
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
