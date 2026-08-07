
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleX,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Search,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  Tag,
  User,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { AuthorOrContact } from "@/types/dataTypes";
import { UserType } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface ResearchPaperWithRelations {
  id: string;
  paperId: string;
  doi: string | null;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  rating: number | null;
  submissionDate: Date;
  acceptedDate: Date | null;
  status: string;
  contributors: AuthorOrContact[];
  pointOfContact: AuthorOrContact;
  author: {
    id: string;
    name: string;
    email: string;
    userType: UserType;
  } | null;
}

interface SearchFilters {
  titleQuery: string;
  keywordQuery: string;
  authorQuery: string;
  abstractQuery: string;
  sortBy: "submissionDate" | "acceptedDate" | "title";
  sortOrder: "asc" | "desc";
  yearFilter: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  titleQuery: "",
  keywordQuery: "",
  authorQuery: "",
  abstractQuery: "",
  sortBy: "submissionDate",
  sortOrder: "desc",
  yearFilter: "",
};

const PAPERS_PER_PAGE = 5;

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncateText(text: string, limit = 450) {
  if (!text) return "";

  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trim()}…`;
}

function filtersHaveSearch(filters: SearchFilters) {
  return Boolean(
    filters.titleQuery.trim() ||
      filters.keywordQuery.trim() ||
      filters.authorQuery.trim() ||
      filters.abstractQuery.trim()
  );
}

function filtersAreEqual(
  a: SearchFilters,
  b: SearchFilters
): boolean {
  return (
    a.titleQuery === b.titleQuery &&
    a.keywordQuery === b.keywordQuery &&
    a.authorQuery === b.authorQuery &&
    a.abstractQuery === b.abstractQuery &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder &&
    a.yearFilter === b.yearFilter
  );
}

/* -------------------------------------------------------------------------- */
/*                         FILTER MATCHING                                    */
/* -------------------------------------------------------------------------- */

function paperMatchesFilters(
  paper: ResearchPaperWithRelations,
  filters: SearchFilters
) {
  /* ------------------------------ TITLE -------------------------------- */

  if (filters.titleQuery.trim()) {
    const query = normalize(filters.titleQuery);

    if (!normalize(paper.title).includes(query)) {
      return false;
    }
  }

  /* ----------------------------- KEYWORDS ------------------------------ */

  if (filters.keywordQuery.trim()) {
    const terms = filters.keywordQuery
      .split(",")
      .map((term) => normalize(term))
      .filter(Boolean);

    const keywords = (paper.keywords ?? []).map(normalize);

    const keywordMatch = terms.some((term) =>
      keywords.some((keyword) => keyword.includes(term))
    );

    if (!keywordMatch) {
      return false;
    }
  }

  /* ------------------------------ AUTHOR -------------------------------- */

  if (filters.authorQuery.trim()) {
    const query = normalize(filters.authorQuery);

    const contributorMatch = (
      paper.contributors ?? []
    ).some((contributor) => {
      return (
        normalize(contributor.fullName).includes(query) ||
        normalize(contributor.affiliation).includes(query)
      );
    });

    const primaryAuthorMatch =
      normalize(paper.author?.name).includes(query) ||
      normalize(paper.author?.email).includes(query);

    const pointOfContactMatch =
      normalize(paper.pointOfContact?.fullName).includes(query) ||
      normalize(paper.pointOfContact?.affiliation).includes(query);

    if (
      !contributorMatch &&
      !primaryAuthorMatch &&
      !pointOfContactMatch
    ) {
      return false;
    }
  }

  /* ----------------------------- ABSTRACT ------------------------------ */

  if (filters.abstractQuery.trim()) {
    const query = normalize(filters.abstractQuery);

    if (!normalize(paper.abstract).includes(query)) {
      return false;
    }
  }

  /* -------------------------------- YEAR -------------------------------- */

  if (
    filters.yearFilter &&
    filters.yearFilter !== "all"
  ) {
    const submissionYear = paper.submissionDate
      ? new Date(paper.submissionDate)
          .getFullYear()
          .toString()
      : "";

    const acceptedYear = paper.acceptedDate
      ? new Date(paper.acceptedDate)
          .getFullYear()
          .toString()
      : "";

    if (
      submissionYear !== filters.yearFilter &&
      acceptedYear !== filters.yearFilter
    ) {
      return false;
    }
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                              SORT PAPERS                                   */
/* -------------------------------------------------------------------------- */

function sortPapers(
  papers: ResearchPaperWithRelations[],
  filters: SearchFilters
) {
  const sorted = [...papers];

  sorted.sort((a, b) => {
    if (filters.sortBy === "title") {
      const result = a.title.localeCompare(b.title);

      return filters.sortOrder === "asc"
        ? result
        : -result;
    }

    const aDate =
      filters.sortBy === "acceptedDate"
        ? a.acceptedDate
        : a.submissionDate;

    const bDate =
      filters.sortBy === "acceptedDate"
        ? b.acceptedDate
        : b.submissionDate;

    const aTime = aDate
      ? new Date(aDate).getTime()
      : 0;

    const bTime = bDate
      ? new Date(bDate).getTime()
      : 0;

    return filters.sortOrder === "asc"
      ? aTime - bTime
      : bTime - aTime;
  });

  return sorted;
}

/* -------------------------------------------------------------------------- */
/*                           URL SERIALIZATION                                */
/* -------------------------------------------------------------------------- */

function filtersToParams(filters: SearchFilters) {
  const params = new URLSearchParams();

  if (filters.titleQuery.trim()) {
    params.set("q", filters.titleQuery.trim());
  }

  if (filters.keywordQuery.trim()) {
    params.set(
      "keywords",
      filters.keywordQuery.trim()
    );
  }

  if (filters.authorQuery.trim()) {
    params.set(
      "author",
      filters.authorQuery.trim()
    );
  }

  if (filters.abstractQuery.trim()) {
    params.set(
      "abstract",
      filters.abstractQuery.trim()
    );
  }

  if (filters.sortBy !== "submissionDate") {
    params.set("sortBy", filters.sortBy);
  }

  if (filters.sortOrder !== "desc") {
    params.set("order", filters.sortOrder);
  }

  if (filters.yearFilter) {
    params.set("year", filters.yearFilter);
  }

  return params;
}

function paramsToFilters(
  searchParams: URLSearchParams
): SearchFilters {
  const sortBy = searchParams.get("sortBy");

  const sortOrder = searchParams.get("order");

  return {
    titleQuery: searchParams.get("q") ?? "",
    keywordQuery:
      searchParams.get("keywords") ?? "",
    authorQuery:
      searchParams.get("author") ?? "",
    abstractQuery:
      searchParams.get("abstract") ?? "",
    sortBy:
      sortBy === "acceptedDate" ||
      sortBy === "title"
        ? sortBy
        : "submissionDate",
    sortOrder:
      sortOrder === "asc" ? "asc" : "desc",
    yearFilter:
      searchParams.get("year") ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/*                              SKELETON                                     */
/* -------------------------------------------------------------------------- */

function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="h-12 w-full max-w-3xl" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl" />

        <div className="mt-8 space-y-5">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <Card
                key={index}
                className="rounded-2xl"
              >
                <CardContent className="space-y-5 p-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            FILTER DRAWER                                   */
/* -------------------------------------------------------------------------- */

interface FilterDrawerProps {
  open: boolean;
  filters: SearchFilters;
  availableYears: string[];
  loading: boolean;
  onClose: () => void;
  onChange: (
    key: keyof SearchFilters,
    value: string
  ) => void;
  onApply: () => void;
  onClear: () => void;
}

function FilterDrawer({
  open,
  filters,
  availableYears,
  loading,
  onClose,
  onChange,
  onApply,
  onClear,
}: FilterDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />

              <h2 className="font-semibold">
                Search filters
              </h2>

              {filtersHaveSearch(filters) && (
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px]"
                >
                  Active
                </Badge>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Refine the research collection
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Paper title
              </Label>

              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={filters.titleQuery}
                  onChange={(event) =>
                    onChange(
                      "titleQuery",
                      event.target.value
                    )
                  }
                  placeholder="Search paper title..."
                  className="h-11 rounded-xl pl-9"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onApply();
                    }
                  }}
                />
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Keywords
              </Label>

              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={filters.keywordQuery}
                  onChange={(event) =>
                    onChange(
                      "keywordQuery",
                      event.target.value
                    )
                  }
                  placeholder="AI, robotics, climate..."
                  className="h-11 rounded-xl pl-9"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onApply();
                    }
                  }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                Separate multiple keywords with commas.
              </p>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Author
              </Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={filters.authorQuery}
                  onChange={(event) =>
                    onChange(
                      "authorQuery",
                      event.target.value
                    )
                  }
                  placeholder="Author name, email..."
                  className="h-11 rounded-xl pl-9"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onApply();
                    }
                  }}
                />
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Abstract
              </Label>

              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={filters.abstractQuery}
                  onChange={(event) =>
                    onChange(
                      "abstractQuery",
                      event.target.value
                    )
                  }
                  placeholder="Search within abstracts..."
                  className="h-11 rounded-xl pl-9"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onApply();
                    }
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Year */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Publication year
              </Label>

              <Select
                value={
                  filters.yearFilter || "all"
                }
                onValueChange={(value) =>
                  onChange(
                    "yearFilter",
                    value === "all" ? "" : value
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All years
                  </SelectItem>

                  {availableYears.map((year) => (
                    <SelectItem
                      key={year}
                      value={year}
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {filters.sortOrder === "desc" ? (
                  <SortDesc className="h-3.5 w-3.5" />
                ) : (
                  <SortAsc className="h-3.5 w-3.5" />
                )}
                Sort by
              </Label>

              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  onChange(
                    "sortBy",
                    value as SearchFilters["sortBy"]
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="submissionDate">
                    Submission date
                  </SelectItem>

                  <SelectItem value="acceptedDate">
                    Publication date
                  </SelectItem>

                  <SelectItem value="title">
                    Title
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Order
              </Label>

              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  onChange(
                    "sortOrder",
                    value as SearchFilters["sortOrder"]
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="desc">
                    Newest first
                  </SelectItem>

                  <SelectItem value="asc">
                    Oldest first
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-background p-5">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClear}
              disabled={loading}
              className="h-11 flex-1 rounded-xl"
            >
              <CircleX className="mr-2 h-4 w-4" />
              Clear
            </Button>

            <Button
              onClick={onApply}
              disabled={loading}
              className="h-11 flex-[1.5] rounded-xl"
            >
              <Search className="mr-2 h-4 w-4" />

              {loading
                ? "Searching..."
                : "Apply filters"}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          ACTIVE FILTER CHIPS                               */
/* -------------------------------------------------------------------------- */

function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: SearchFilters;
  onRemove: (
    key: keyof SearchFilters
  ) => void;
}) {
  const items = [
    {
      key: "titleQuery" as const,
      label: "Title",
      value: filters.titleQuery,
    },
    {
      key: "keywordQuery" as const,
      label: "Keywords",
      value: filters.keywordQuery,
    },
    {
      key: "authorQuery" as const,
      label: "Author",
      value: filters.authorQuery,
    },
    {
      key: "abstractQuery" as const,
      label: "Abstract",
      value: filters.abstractQuery,
    },
    {
      key: "yearFilter" as const,
      label: "Year",
      value: filters.yearFilter,
    },
  ].filter((item) => item.value);

  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Active:
      </span>

      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onRemove(item.key)}
          className="group inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted"
        >
          <span className="text-muted-foreground">
            {item.label}:
          </span>

          <span className="max-w-[180px] truncate font-medium">
            {item.value}
          </span>

          <X className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PAPER CARD                                   */
/* -------------------------------------------------------------------------- */

function PaperCard({
  paper,
  expanded,
  onToggleAbstract,
}: {
  paper: ResearchPaperWithRelations;
  expanded: boolean;
  onToggleAbstract: (
    paperId: string
  ) => void;
}) {
  const [copied, setCopied] =
    useState(false);

  const copyDOI = async () => {
    if (!paper.doi) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        paper.doi
      );

      setCopied(true);
      toast.success("DOI copied");

      setTimeout(
        () => setCopied(false),
        1500
      );
    } catch {
      toast.error("Unable to copy DOI");
    }
  };

  const contributors =
    paper.contributors ?? [];

  return (
    <Card className="group overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="h-1 bg-primary" />

      <CardContent className="p-5 sm:p-6">
        {/* Top metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full text-[10px] uppercase tracking-wide"
          >
            Published
          </Badge>

          {paper.acceptedDate && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(
                paper.acceptedDate
              )}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/paper/${paper.paperId}`}
          className="mt-3 block"
        >
          <h3 className="text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
            {paper.title}
          </h3>
        </Link>

        {/* Authors */}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <User className="h-4 w-4 text-muted-foreground" />

          {contributors.length ? (
            contributors.map(
              (contributor, index) => (
                <React.Fragment
                  key={`${contributor.fullName}-${index}`}
                >
                  <span className="text-sm font-medium">
                    {contributor.fullName}
                  </span>

                  {index <
                    contributors.length - 1 && (
                    <span className="text-muted-foreground">
                      ·
                    </span>
                  )}
                </React.Fragment>
              )
            )
          ) : paper.author?.name ? (
            <span className="text-sm font-medium">
              {paper.author.name}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              No contributor information
            </span>
          )}
        </div>

        {/* Affiliations */}
        {contributors.length > 0 && (
          <div className="mt-2 space-y-1">
            {contributors
              .slice(0, 2)
              .map(
                (
                  contributor,
                  index
                ) =>
                  contributor.affiliation ? (
                    <p
                      key={index}
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      {contributor.affiliation}
                    </p>
                  ) : null
              )}
          </div>
        )}

        {/* Dates / DOI */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Submitted{" "}
            {formatDate(
              paper.submissionDate
            )}
          </span>

          {paper.doi && (
            <button
              type="button"
              onClick={copyDOI}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-[11px] hover:bg-muted"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}

              DOI: {paper.doi}
            </button>
          )}
        </div>

        {/* Keywords */}
        {paper.keywords?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {paper.keywords
              .slice(0, 6)
              .map((keyword, index) => (
                <Badge
                  key={`${keyword}-${index}`}
                  variant="outline"
                  className="rounded-full text-[10px]"
                >
                  {keyword}
                </Badge>
              ))}

            {paper.keywords.length > 6 && (
              <Badge
                variant="outline"
                className="rounded-full text-[10px]"
              >
                +{paper.keywords.length - 6}
              </Badge>
            )}
          </div>
        )}

        <Separator className="my-5" />

        {/* Abstract */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Abstract
            </span>

            {paper.abstract?.length >
              450 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onToggleAbstract(
                    paper.paperId
                  )
                }
                className="h-7 rounded-lg text-xs"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="mr-1 h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-3.5 w-3.5" />
                    Read more
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-sm leading-7 text-muted-foreground">
            {expanded
              ? paper.abstract
              : truncateText(
                  paper.abstract
                )}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">
            ID: {paper.paperId}
          </span>

          <div className="flex items-center gap-2">
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  DOI
                </Button>
              </a>
            )}

            <Link
              href={`/paper/${paper.paperId}`}
            >
              <Button
                size="sm"
                className="rounded-xl"
              >
                View paper
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN CONTENT                                  */
/* -------------------------------------------------------------------------- */

function PaperSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] =
    useState<SearchFilters>(
      DEFAULT_FILTERS
    );

  const [papers, setPapers] =
    useState<
      ResearchPaperWithRelations[]
    >([]);

  const [loading, setLoading] =
    useState(false);

  const [totalResults, setTotalResults] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [
    expandedAbstracts,
    setExpandedAbstracts,
  ] = useState<Set<string>>(
    new Set()
  );

  const [
    filterDrawerOpen,
    setFilterDrawerOpen,
  ] = useState(false);

  const [
    initialized,
    setInitialized,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*                       INITIALIZE FROM URL                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const urlFilters =
      paramsToFilters(
        searchParams
      );

    setFilters(urlFilters);
    setInitialized(true);
  }, [searchParams]);

  /* ---------------------------------------------------------------------- */
  /*                          AVAILABLE YEARS                               */
  /* ---------------------------------------------------------------------- */

  const availableYears = useMemo(() => {
    const years = new Set<string>();

    papers.forEach((paper) => {
      if (paper.submissionDate) {
        years.add(
          new Date(
            paper.submissionDate
          )
            .getFullYear()
            .toString()
        );
      }

      if (paper.acceptedDate) {
        years.add(
          new Date(
            paper.acceptedDate
          )
            .getFullYear()
            .toString()
        );
      }
    });

    return Array.from(years).sort(
      (a, b) =>
        Number(b) - Number(a)
    );
  }, [papers]);

  /* ---------------------------------------------------------------------- */
  /*                           UPDATE URL                                   */
  /* ---------------------------------------------------------------------- */

  const updateUrl = useCallback(
    (nextFilters: SearchFilters) => {
      const params =
        filtersToParams(
          nextFilters
        );

      const query =
        params.toString();

      const url = query
        ? `${pathname}?${query}`
        : pathname;

      router.replace(url, {
        scroll: false,
      });
    },
    [pathname, router]
  );

  /* ---------------------------------------------------------------------- */
  /*                        FETCH PAPERS                                    */
  /* ---------------------------------------------------------------------- */

  const fetchPapers = useCallback(
    async (
      activeFilters: SearchFilters,
      targetPage: number
    ) => {
      setLoading(true);

      try {
        const params =
          new URLSearchParams();

        /*
         * Always send these to the API.
         *
         * Your current API may only consume some of them.
         * The frontend below still performs local filtering
         * as a fallback.
         */

        params.set(
          "status",
          "PUBLISH"
        );

        params.set(
          "page",
          "1"
        );

        params.set(
          "limit",
          "100"
        );

        params.set(
          "sortBy",
          activeFilters.sortBy
        );

        params.set(
          "order",
          activeFilters.sortOrder
        );

        if (
          activeFilters.titleQuery.trim()
        ) {
          params.set(
            "title",
            activeFilters.titleQuery.trim()
          );

          params.set(
            "q",
            activeFilters.titleQuery.trim()
          );
        }

        if (
          activeFilters.keywordQuery.trim()
        ) {
          params.set(
            "keywords",
            activeFilters.keywordQuery.trim()
          );
        }

        if (
          activeFilters.authorQuery.trim()
        ) {
          params.set(
            "author",
            activeFilters.authorQuery.trim()
          );
        }

        if (
          activeFilters.abstractQuery.trim()
        ) {
          params.set(
            "abstract",
            activeFilters.abstractQuery.trim()
          );
        }

        if (
          activeFilters.yearFilter
        ) {
          params.set(
            "year",
            activeFilters.yearFilter
          );
        }

        console.log(
          "Paper search request:",
          `/api/paper?${params.toString()}`
        );

        const response =
          await axios.get(
            `/api/paper?${params.toString()}`
          );

        let result: ResearchPaperWithRelations[] =
          response.data?.papers ??
          [];

        /*
         * IMPORTANT:
         *
         * We still filter locally.
         * This guarantees the frontend works even
         * if /api/paper does not yet implement all
         * advanced query parameters.
         */

        result =
          result.filter((paper) =>
            paperMatchesFilters(
              paper,
              activeFilters
            )
          );

        /*
         * Apply sorting locally as well.
         * This guarantees consistent behavior even
         * if the API sorting implementation differs.
         */

        result = sortPapers(
          result,
          activeFilters
        );

        const total =
          result.length;

        const start =
          (targetPage - 1) *
          PAPERS_PER_PAGE;

        const end =
          start +
          PAPERS_PER_PAGE;

        const paginated =
          result.slice(
            start,
            end
          );

        setPapers(
          paginated
        );

        setTotalResults(
          total
        );

        setPage(
          targetPage
        );
      } catch (error) {
        console.error(
          "Paper search error:",
          error
        );

        if (
          axios.isAxiosError(
            error
          )
        ) {
          console.error(
            "API response:",
            error.response?.data
          );

          toast.error(
            error.response?.data
              ?.message ??
              error.message ??
              "Failed to search papers"
          );
        } else {
          toast.error(
            "Failed to search papers"
          );
        }

        setPapers([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /*                       APPLY FILTERS                                    */
  /* ---------------------------------------------------------------------- */

  const applyFilters = useCallback(
    (nextFilters?: SearchFilters) => {
      const activeFilters =
        nextFilters ?? filters;

      setExpandedAbstracts(
        new Set()
      );

      setPage(1);

      updateUrl(
        activeFilters
      );

      setFilterDrawerOpen(
        false
      );

      fetchPapers(
        activeFilters,
        1
      );
    },
    [
      filters,
      updateUrl,
      fetchPapers,
    ]
  );

  /* ---------------------------------------------------------------------- */
  /*                     FILTER FIELD CHANGE                                */
  /* ---------------------------------------------------------------------- */

  const handleFilterChange =
    useCallback(
      (
        key: keyof SearchFilters,
        value: string
      ) => {
        setFilters(
          (previous) => ({
            ...previous,
            [key]: value,
          })
        );
      },
      []
    );

  /* ---------------------------------------------------------------------- */
  /*                         CLEAR FILTERS                                  */
  /* ---------------------------------------------------------------------- */

  const clearFilters =
    useCallback(() => {
      setFilters(
        DEFAULT_FILTERS
      );

      setExpandedAbstracts(
        new Set()
      );

      setPage(1);

      updateUrl(
        DEFAULT_FILTERS
      );

      setFilterDrawerOpen(
        false
      );

      fetchPapers(
        DEFAULT_FILTERS,
        1
      );
    }, [
      updateUrl,
      fetchPapers,
    ]);

  /* ---------------------------------------------------------------------- */
  /*                         INITIAL FETCH                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!initialized) {
      return;
    }

    fetchPapers(
      filters,
      1
    );
  }, [
    initialized,
    fetchPapers,
  ]);

  /* ---------------------------------------------------------------------- */
  /*                       PAGINATION                                      */
  /* ---------------------------------------------------------------------- */

  const totalPages = Math.ceil(
    totalResults /
      PAPERS_PER_PAGE
  );

  const goToPage = (
    nextPage: number
  ) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      loading
    ) {
      return;
    }

    fetchPapers(
      filters,
      nextPage
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ---------------------------------------------------------------------- */
  /*                        ABSTRACT TOGGLE                                 */
  /* ---------------------------------------------------------------------- */

  const toggleAbstract =
    (paperId: string) => {
      setExpandedAbstracts(
        (previous) => {
          const next =
            new Set(
              previous
            );

          if (
            next.has(paperId)
          ) {
            next.delete(
              paperId
            );
          } else {
            next.add(
              paperId
            );
          }

          return next;
        }
      );
    };

  /* ---------------------------------------------------------------------- */
  /*                         FILTER REMOVE                                  */
  /* ---------------------------------------------------------------------- */

  const removeFilter = (
    key: keyof SearchFilters
  ) => {
    const nextFilters = {
      ...filters,
      [key]:
        key === "sortBy"
          ? "submissionDate"
          : key === "sortOrder"
            ? "desc"
            : "",
    };

    setFilters(
      nextFilters
    );

    applyFilters(
      nextFilters
    );
  };

  /* ---------------------------------------------------------------------- */
  /*                             LOADING                                    */
  /* ---------------------------------------------------------------------- */

  if (!initialized) {
    return (
      <SearchSkeleton />
    );
  }

  const hasSearch =
    filtersHaveSearch(
      filters
    );

  /* ---------------------------------------------------------------------- */
  /*                               UI                                       */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-background">
      {/* ---------------------------------------------------------------- */}
      {/* HERO / SEARCH                                                   */}
      {/* ---------------------------------------------------------------- */}

      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full px-3 py-1"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Research Library
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {hasSearch
                ? "Search research papers"
                : "Explore published research"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Discover published research by
              title, author, keyword, abstract,
              publication year, and more.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="mt-8 max-w-5xl">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={
                    filters.titleQuery
                  }
                  onChange={(event) =>
                    handleFilterChange(
                      "titleQuery",
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      applyFilters();
                    }
                  }}
                  placeholder="Search papers by title..."
                  className="h-14 rounded-2xl border bg-background pl-12 pr-4 text-sm shadow-sm sm:text-base"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFilterDrawerOpen(
                    true
                  )
                }
                className="h-14 rounded-2xl px-5"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />

                Filters

                {hasSearch && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {
                      [
                        filters.titleQuery,
                        filters.keywordQuery,
                        filters.authorQuery,
                        filters.abstractQuery,
                        filters.yearFilter,
                      ].filter(Boolean)
                        .length
                    }
                  </span>
                )}
              </Button>

              <Button
                type="button"
                onClick={() =>
                  applyFilters()
                }
                disabled={loading}
                className="h-14 rounded-2xl px-6"
              >
                <Search className="mr-2 h-4 w-4" />

                {loading
                  ? "Searching..."
                  : "Search"}
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Use Filters for advanced
              search options.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CONTENT                                                          */}
      {/* ---------------------------------------------------------------- */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results header */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {hasSearch
                    ? "Search results"
                    : "Published papers"}
                </h2>

                {!loading && (
                  <Badge
                    variant="secondary"
                    className="rounded-full"
                  >
                    {totalResults}
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {loading
                  ? "Searching the research collection..."
                  : totalResults === 1
                    ? "1 paper found"
                    : `${totalResults} papers found`}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilterDrawerOpen(
                  true
                )
              }
              className="w-fit rounded-xl"
            >
              <Filter className="mr-2 h-4 w-4" />
              Advanced filters
            </Button>
          </div>

          <ActiveFilterChips
            filters={filters}
            onRemove={removeFilter}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-5">
            {Array.from({
              length: PAPERS_PER_PAGE,
            }).map((_, index) => (
              <Card
                key={index}
                className="rounded-2xl"
              >
                <CardContent className="space-y-5 p-6">
                  <Skeleton className="h-5 w-20 rounded-full" />

                  <Skeleton className="h-7 w-4/5" />

                  <Skeleton className="h-4 w-1/2" />

                  <Skeleton className="h-20 w-full" />

                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : papers.length === 0 ? (
          <Card className="rounded-2xl border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold">
                {hasSearch
                  ? "No research papers found"
                  : "No published papers"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {hasSearch
                  ? "Try changing your search terms or removing one of the filters."
                  : "Published research papers will appear here once they are available."}
              </p>

              {hasSearch && (
                <Button
                  variant="outline"
                  onClick={
                    clearFilters
                  }
                  className="mt-5 rounded-xl"
                >
                  <CircleX className="mr-2 h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {papers.map((paper) => (
              <PaperCard
                key={
                  paper.paperId
                }
                paper={paper}
                expanded={expandedAbstracts.has(
                  paper.paperId
                )}
                onToggleAbstract={
                  toggleAbstract
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Page{" "}
                <span className="font-medium text-foreground">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    goToPage(
                      page - 1
                    )
                  }
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>

                <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs">
                  {page} /{" "}
                  {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={
                    page >=
                      totalPages ||
                    loading
                  }
                  onClick={() =>
                    goToPage(
                      page + 1
                    )
                  }
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* RIGHT FILTER DRAWER                                             */}
      {/* ---------------------------------------------------------------- */}

      <FilterDrawer
        open={filterDrawerOpen}
        filters={filters}
        availableYears={
          availableYears
        }
        loading={loading}
        onClose={() =>
          setFilterDrawerOpen(
            false
          )
        }
        onChange={
          handleFilterChange
        }
        onApply={() =>
          applyFilters()
        }
        onClear={
          clearFilters
        }
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */

export default function PaperSearchPage() {
  return (
    <Suspense
      fallback={
        <SearchSkeleton />
      }
    >
      <PaperSearchContent />
    </Suspense>
  );
}

