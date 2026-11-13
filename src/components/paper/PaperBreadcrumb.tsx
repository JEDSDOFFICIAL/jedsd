import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PaperBreadcrumbProps {
  volume?: number | null;
  issueNumber?: number | null;
  paperId: string;
  title: string;
}

export default function PaperBreadcrumb({
  volume,
  issueNumber,
  paperId,
  title,
}: PaperBreadcrumbProps) {
  // Truncate title for breadcrumb
  const truncatedTitle = title.length > 50 ? title.slice(0, 50) + "..." : title;

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </li>
        <ChevronRight className="h-3.5 w-3.5" />

        {volume ? (
          <>
            <li>
              <Link
                href="/publications"
                className="hover:text-primary transition-colors"
              >
                Publications
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" />
            <li>
              <Link
                href={`/publications/volume/${volume}`}
                className="hover:text-primary transition-colors"
              >
                Vol. {volume}
              </Link>
            </li>
            {issueNumber && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <li>
                  <Link
                    href={`/publications/volume/${volume}/issue/${issueNumber}`}
                    className="hover:text-primary transition-colors"
                  >
                    Issue {issueNumber}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            <li>
              <Link
                href="/archive"
                className="hover:text-primary transition-colors"
              >
                Archive
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}

        <li className="text-foreground font-medium line-clamp-1">
          {truncatedTitle}
        </li>
      </ol>
    </nav>
  );
}
