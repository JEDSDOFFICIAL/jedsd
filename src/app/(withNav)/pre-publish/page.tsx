"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Search,
  CheckCircle,
  Award,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { AuthorOrContact } from "@/types/dataTypes";
import { IconAffiliate } from "@tabler/icons-react";

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  submissionDate: string;
  acceptedDate?: string;
  status: string;
  filePath: string;
  author?: {
    name: string;
    email: string;
  };
  contributors?: AuthorOrContact[];
  pointOfContact?: any;
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

function PrePublishContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(
    new Set()
  );
  const [mounted, setMounted] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    titleQuery: "",
    keywordQuery: "",
    authorQuery: "",
    abstractQuery: "",
    sortBy: "acceptedDate",
    sortOrder: "desc",
    yearFilter: "",
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);

    // Initialize filters from URL params after mounting
    const urlQuery = searchParams.get("q") || "";
    const urlSortBy = searchParams.get("sortBy") || "acceptedDate";
    const urlSortOrder = searchParams.get("order") || "desc";
    const urlYear = searchParams.get("year") || "";

    setFilters({
      titleQuery: urlQuery,
      keywordQuery: "",
      authorQuery: "",
      abstractQuery: "",
      sortBy: urlSortBy as any,
      sortOrder: urlSortOrder as any,
      yearFilter: urlYear,
    });
  }, [searchParams]);

  // Get unique years from papers for filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    papers.forEach((paper) => {
      if (paper.acceptedDate) {
        const acceptedYear = new Date(paper.acceptedDate)
          .getFullYear()
          .toString();
        years.add(acceptedYear);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [papers]);

  // Fetch papers based on current filters (only accepted papers)
  const fetchPapers = async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      // Fetch only accepted papers
      const urlParams = new URLSearchParams();
      urlParams.append("status", "ACCEPTED");
      urlParams.append("page", "1");
      urlParams.append("limit", "100");
      urlParams.append("sortBy", filters.sortBy);
      urlParams.append("order", filters.sortOrder);

      // Only use API search for title if it's the only search term
      const hasOnlyTitleSearch =
        filters.titleQuery.trim() &&
        !filters.keywordQuery.trim() &&
        !filters.authorQuery.trim() &&
        !filters.abstractQuery.trim();

      if (hasOnlyTitleSearch) {
        urlParams.append("title", filters.titleQuery);
      }

      console.log("API URL:", `/api/paper?${urlParams.toString()}`);
      const response = await axios.get(`/api/paper?${urlParams.toString()}`);

      let filteredPapers = response.data.papers || [];

      // Client-side comprehensive search
      if (
        filters.titleQuery.trim() ||
        filters.keywordQuery.trim() ||
        filters.authorQuery.trim() ||
        filters.abstractQuery.trim()
      ) {
        filteredPapers = filteredPapers.filter((paper: ResearchPaper) => {
          let matches = true;

          // Title search
          if (filters.titleQuery.trim()) {
            const titleMatch = paper.title
              ?.toLowerCase()
              .includes(filters.titleQuery.toLowerCase());
            if (!titleMatch) matches = false;
          }

          // Keyword search
          if (filters.keywordQuery.trim() && matches) {
            const keywordTerms = filters.keywordQuery
              .toLowerCase()
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k);
            const keywordMatch = keywordTerms.some((term) =>
              paper.keywords?.some((keyword) =>
                keyword.toLowerCase().includes(term)
              )
            );
            if (!keywordMatch) matches = false;
          }

          // Author search
          if (filters.authorQuery.trim() && matches) {
            const authorTerm = filters.authorQuery.toLowerCase();
            const authorMatch =
              paper.author?.name?.toLowerCase().includes(authorTerm) ||
              paper.author?.email?.toLowerCase().includes(authorTerm);
            if (!authorMatch) matches = false;
          }

          // Abstract search
          if (filters.abstractQuery.trim() && matches) {
            const abstractMatch = paper.abstract
              ?.toLowerCase()
              .includes(filters.abstractQuery.toLowerCase());
            if (!abstractMatch) matches = false;
          }

          return matches;
        });
      }

      // Client-side filtering for year (only acceptance year for pre-publish)
      if (filters.yearFilter && filters.yearFilter !== "all") {
        filteredPapers = filteredPapers.filter((paper: ResearchPaper) => {
          const acceptedYear = paper.acceptedDate
            ? new Date(paper.acceptedDate).getFullYear().toString()
            : null;
          return acceptedYear === filters.yearFilter;
        });
      }

      // Client-side pagination
      const totalCount = filteredPapers.length;
      const startIndex = (currentPage - 1) * 5;
      const endIndex = startIndex + 5;
      const paginatedPapers = filteredPapers.slice(startIndex, endIndex);

      setPapers(paginatedPapers);
      setTotalResults(totalCount);

      if (resetPage) setPage(1);
    } catch (error) {
      console.error("Error fetching accepted papers:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error details:", error.response?.data);
        toast.error(
          `Failed to fetch accepted papers: ${error.response?.data?.message || error.message}`
        );
      } else {
        toast.error("Failed to fetch accepted papers");
      }
      setPapers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Update URL with current search state (debounced)
      setTimeout(() => {
        const params = new URLSearchParams();
        if (newFilters.titleQuery) params.set("q", newFilters.titleQuery);
        if (newFilters.sortBy !== "acceptedDate")
          params.set("sortBy", newFilters.sortBy);
        if (newFilters.sortOrder !== "desc")
          params.set("order", newFilters.sortOrder);
        if (newFilters.yearFilter && newFilters.yearFilter !== "all")
          params.set("year", newFilters.yearFilter);

        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newURL);
      }, 100);

      return newFilters;
    });
  };

  // Handle search action
  const handleSearch = () => {
    fetchPapers(true);
  };

  // Trigger search when sort/year filters change
  useEffect(() => {
    if (!mounted) return;

    const timeoutId = setTimeout(() => {
      fetchPapers(true);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filters.sortBy, filters.sortOrder, filters.yearFilter, mounted]);

  // Trigger search when page changes
  useEffect(() => {
    if (!mounted) return;
    fetchPapers(false);
  }, [page, mounted]);

  // Toggle abstract expansion
  const toggleAbstract = (paperId: string) => {
    setExpandedAbstracts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paperId)) {
        newSet.delete(paperId);
      } else {
        newSet.add(paperId);
      }
      return newSet;
    });
  };

  // Truncate abstract
  const truncateAbstract = (abstract: string, limit: number = 150) => {
    if (abstract.length <= limit) return abstract;
    return abstract.substring(0, limit) + "...";
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Navigate to paper details
  const viewPaperDetails = (paperId: string) => {
    router.push(`/paper/${paperId}`);
  };

  // Initial load
  useEffect(() => {
    if (mounted) {
      fetchPapers(true);
    }
  }, [mounted]);

  // Watch for URL parameter changes
  useEffect(() => {
    if (!mounted) return;

    const urlQuery = searchParams.get("q") || "";
    const urlSortBy = searchParams.get("sortBy") || "acceptedDate";
    const urlSortOrder = searchParams.get("order") || "desc";
    const urlYear = searchParams.get("year") || "";

    const newFilters = {
      titleQuery: urlQuery,
      keywordQuery: "",
      authorQuery: "",
      abstractQuery: "",
      sortBy: urlSortBy as any,
      sortOrder: urlSortOrder as any,
      yearFilter: urlYear,
    };

    const filtersChanged =
      newFilters.titleQuery !== filters.titleQuery ||
      newFilters.sortBy !== filters.sortBy ||
      newFilters.sortOrder !== filters.sortOrder ||
      newFilters.yearFilter !== filters.yearFilter;

    if (filtersChanged) {
      setFilters(newFilters);
      setTimeout(() => fetchPapers(true), 0);
    }
  }, [searchParams, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-1/2 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="h-96 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-full py-8">
      {/* Header */}
      <div className="mb-8 w-full text-center border-b-2 border-black pb-3">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Award className="h-8 w-8 text-green-600" />
          {filters.titleQuery ||
          filters.keywordQuery ||
          filters.authorQuery ||
          filters.abstractQuery
            ? "Search Results - Accepted Papers"
            : "Pre-Publish: Accepted Papers"}
        </h1>
        <p className="text-muted-foreground">
          {filters.titleQuery ||
          filters.keywordQuery ||
          filters.authorQuery ||
          filters.abstractQuery
            ? "Search results from accepted papers ready for publication"
            : "Browse accepted research papers ready for publication. Use the sidebar to search with specific criteria."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Advanced Search
                {(filters.titleQuery ||
                  filters.keywordQuery ||
                  filters.authorQuery ||
                  filters.abstractQuery) && (
                  <Badge variant="secondary" className="ml-auto">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Search through accepted papers using multiple criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title Search */}
              <div className="space-y-2">
                <Label
                  htmlFor="title-search"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Title
                </Label>
                <Input
                  id="title-search"
                  placeholder="Search by title..."
                  value={filters.titleQuery}
                  onChange={(e) =>
                    handleFilterChange("titleQuery", e.target.value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              {/* Keyword Search */}
              <div className="space-y-2">
                <Label
                  htmlFor="keyword-search"
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Keywords
                </Label>
                <Input
                  id="keyword-search"
                  placeholder="machine learning, AI..."
                  value={filters.keywordQuery}
                  onChange={(e) =>
                    handleFilterChange("keywordQuery", e.target.value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple keywords with commas
                </p>
              </div>

              {/* Author Search */}
              <div className="space-y-2">
                <Label
                  htmlFor="author-search"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Author
                </Label>
                <Input
                  id="author-search"
                  placeholder="Author name or email..."
                  value={filters.authorQuery}
                  onChange={(e) =>
                    handleFilterChange("authorQuery", e.target.value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              {/* Abstract Search */}
              <div className="space-y-2">
                <Label
                  htmlFor="abstract-search"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Abstract
                </Label>
                <Input
                  id="abstract-search"
                  placeholder="Search in abstract..."
                  value={filters.abstractQuery}
                  onChange={(e) =>
                    handleFilterChange("abstractQuery", e.target.value)
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Button
                onClick={handleSearch}
                className="w-full"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>

              <Separator />

              {/* Sort Options */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sort By
                </Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acceptedDate">
                      Acceptance Date
                    </SelectItem>
                    <SelectItem value="submissionDate">
                      Submission Date
                    </SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) =>
                    handleFilterChange("sortOrder", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Oldest First
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              {availableYears.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Acceptance Year
                  </Label>
                  <Select
                    value={filters.yearFilter || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "yearFilter",
                        value === "all" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Clear Filters */}
              {(filters.titleQuery ||
                filters.keywordQuery ||
                filters.authorQuery ||
                filters.abstractQuery ||
                filters.yearFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      titleQuery: "",
                      keywordQuery: "",
                      authorQuery: "",
                      abstractQuery: "",
                      sortBy: "acceptedDate",
                      sortOrder: "desc",
                      yearFilter: "",
                    });
                    window.history.replaceState(
                      {},
                      "",
                      window.location.pathname
                    );
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Accepted Papers Found
                </h3>
                <p className="text-muted-foreground text-center">
                  {filters.titleQuery ||
                  filters.keywordQuery ||
                  filters.authorQuery ||
                  filters.abstractQuery
                    ? "No accepted papers match your search criteria. Try adjusting your filters."
                    : "There are no accepted papers ready for publication at the moment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results header */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * 5 + 1}-
                  {Math.min(page * 5, totalResults)} of {totalResults} accepted
                  papers
                </p>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Ready for Publication
                </Badge>
              </div>

              {/* Papers List */}
              <div className="space-y-6">
                {papers.map((paper) => (
                  <Card
                    key={paper.id}
                    className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold leading-tight pr-4">
                          {paper.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col w-max justify-between items-start gap-4 text-sm text-muted-foreground mb-4">
                        {paper.contributors &&
                          (paper.contributors.length > 0 ? (
                            paper.contributors.map((contributor, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 w-full justify-between"
                              >
                                <Badge variant="outline" className="bg-green-100 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>{contributor.fullName}</span>
                                </Badge>
                                {contributor.affiliation?.split(",").map((affil, i) => (
                                  <Badge key={i} variant="outline" className="bg-green-100 flex items-center gap-2">
                                    <IconAffiliate />
                                    <span>{affil}</span>
                                  </Badge>
                                ))}
                              </div>
                            ))
                          ) : (
                            <span>No contributors found</span>
                          ))}
                      </div>
                      <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Submitted: {formatDate(paper.submissionDate)}
                        </span>
                      </div>
                      {paper.acceptedDate && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            Accepted: {formatDate(paper.acceptedDate)}
                          </span>
                        </div>
                      )}</div>
                      {/* Keywords */}
                      {paper.keywords && paper.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {paper.keywords.slice(0, 5).map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                          {paper.keywords.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{paper.keywords.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Abstract */}
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          {expandedAbstracts.has(paper.id)
                            ? paper.abstract
                            : truncateAbstract(paper.abstract,450)}
                        </div>
                        {paper.abstract && paper.abstract.length > 450 && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => toggleAbstract(paper.id)}
                            className="p-0 h-auto text-xs mt-2"
                          >
                            {expandedAbstracts.has(paper.id) ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Show More
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalResults > 5 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      setPage(newPage);
                      setTimeout(() => fetchPapers(), 0);
                    }}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(totalResults / 5)}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      setTimeout(() => fetchPapers(), 0);
                    }}
                    disabled={page >= Math.ceil(totalResults / 5) || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PrePublishPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="mb-8">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-muted rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PrePublishContent />
    </Suspense>
  );
}
