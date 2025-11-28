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
  Search
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthorOrContact } from "@/types/dataTypes";
import { IconAffiliate } from "@tabler/icons-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { UserType } from "@prisma/client";

// Align with API response structure
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

function PaperSearchContent() {
  const searchParams = useSearchParams();
  
  const [papers, setPapers] = useState<ResearchPaperWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    titleQuery: "",
    keywordQuery: "",
    authorQuery: "",
    abstractQuery: "",
    sortBy: "submissionDate",
    sortOrder: "desc",
    yearFilter: "",
  });

  // ...existing code...

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    
    // Initialize filters from URL params after mounting
    const urlQuery = searchParams.get("q") || "";
    const urlSortBy = searchParams.get("sortBy") || "submissionDate";
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
    papers.forEach(paper => {
      const year = new Date(paper.submissionDate).getFullYear().toString();
      years.add(year);
      if (paper.acceptedDate) {
        const acceptedYear = new Date(paper.acceptedDate).getFullYear().toString();
        years.add(acceptedYear);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [papers]);

  // Fetch papers based on current filters
  const fetchPapers = async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    setLoading(true);
    
    try {
      // For comprehensive searches, we'll get all papers and filter client-side
      const urlParams = new URLSearchParams();
      urlParams.append("status", "PUBLISH");
      urlParams.append("page", "1");
      urlParams.append("limit", "100"); // Get more papers for comprehensive client-side filtering
      urlParams.append("sortBy", filters.sortBy);
      urlParams.append("order", filters.sortOrder);

      // Only use API search for title if it's the only search term
      const hasOnlyTitleSearch = filters.titleQuery.trim() && 
        !filters.keywordQuery.trim() && 
        !filters.authorQuery.trim() && 
        !filters.abstractQuery.trim();

      if (hasOnlyTitleSearch) {
        urlParams.append("title", filters.titleQuery);
      }

      console.log("API URL:", `/api/paper?${urlParams.toString()}`);
      const response = await axios.get(`/api/paper?${urlParams.toString()}`);
            console.log("Fetched papers:", response.data.papers);
      let filteredPapers = response.data.papers || [];
      
      // Client-side comprehensive search
      if (filters.titleQuery.trim() || filters.keywordQuery.trim() || 
          filters.authorQuery.trim() || filters.abstractQuery.trim()) {
        
        filteredPapers = filteredPapers.filter((paper: ResearchPaperWithRelations) => {
          let matches = true;
          
          // Title search
          if (filters.titleQuery.trim()) {
            const titleMatch = paper.title?.toLowerCase().includes(filters.titleQuery.toLowerCase());
            if (!titleMatch) matches = false;
          }
          
          // Keyword search
          if (filters.keywordQuery.trim() && matches) {
            const keywordTerms = filters.keywordQuery.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
            const keywordMatch = keywordTerms.some(term => 
              paper.keywords?.some(keyword => keyword.toLowerCase().includes(term))
            );
            if (!keywordMatch) matches = false;
          }
          
          // Author search
          if (filters.authorQuery.trim() && matches) {
            const authorTerm = filters.authorQuery.toLowerCase();
            const authorMatch = paper.author?.name?.toLowerCase().includes(authorTerm) ||
                               paper.author?.email?.toLowerCase().includes(authorTerm);
            if (!authorMatch) matches = false;
          }
          
          // Abstract search
          if (filters.abstractQuery.trim() && matches) {
            const abstractMatch = paper.abstract?.toLowerCase().includes(filters.abstractQuery.toLowerCase());
            if (!abstractMatch) matches = false;
          }
          
          return matches;
        });
      }
      
      // Client-side filtering for year
      if (filters.yearFilter && filters.yearFilter !== "all") {
        filteredPapers = filteredPapers.filter((paper: ResearchPaperWithRelations) => {
          const submissionYear = new Date(paper.submissionDate).getFullYear().toString();
          const acceptedYear = paper.acceptedDate ? new Date(paper.acceptedDate).getFullYear().toString() : null;
          return submissionYear === filters.yearFilter || acceptedYear === filters.yearFilter;
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
      console.error("Error fetching papers:", error);
      if (axios.isAxiosError(error)) {
        console.error("API Error details:", error.response?.data);
        toast.error(`Failed to fetch papers: ${error.response?.data?.message || error.message}`);
      } else {
        toast.error("Failed to fetch papers");
      }
      setPapers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);

    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Update URL with current search state (debounced)
      setTimeout(() => {
        const params = new URLSearchParams();
        if (newFilters.titleQuery) params.set("q", newFilters.titleQuery);
        if (newFilters.sortBy !== "submissionDate") params.set("sortBy", newFilters.sortBy);
        if (newFilters.sortOrder !== "desc") params.set("order", newFilters.sortOrder);
        if (newFilters.yearFilter && newFilters.yearFilter !== "all") params.set("year", newFilters.yearFilter);
        
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newURL);
      }, 100);
      
      return newFilters;
    });
  };

  // Handle search action (triggered by search button or enter key)
  const handleSearch = () => {
    fetchPapers(true);
  };

  // Trigger search when sort/year filters change - only after mounting
  useEffect(() => {
    if (!mounted) return;
    
    const timeoutId = setTimeout(() => {
      fetchPapers(true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [filters.sortBy, filters.sortOrder, filters.yearFilter, mounted]);

  // Trigger search when page changes - only after mounting
  useEffect(() => {
    if (!mounted) return;
    fetchPapers(false);
  }, [page, mounted]);

  // Toggle abstract expansion
  const toggleAbstract = (paperId: string) => {
    setExpandedAbstracts(prev => {
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
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

 

  // Initial load - only after mounting
  useEffect(() => {
    if (mounted) {
      fetchPapers(true);
    }
  }, [mounted]);

  // Watch for URL parameter changes (from navbar search) - only after mounting
  useEffect(() => {
    if (!mounted) return;
    
    const urlQuery = searchParams.get("q") || "";
    const urlSortBy = searchParams.get("sortBy") || "submissionDate";
    const urlSortOrder = searchParams.get("order") || "desc";
    const urlYear = searchParams.get("year") || "";

    // Update filters if URL parameters changed
    const newFilters = {
      titleQuery: urlQuery,
      keywordQuery: "",
      authorQuery: "",
      abstractQuery: "",
      sortBy: urlSortBy as any,
      sortOrder: urlSortOrder as any,
      yearFilter: urlYear,
    };

    // Check if filters actually changed
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

  // Prevent hydration mismatch by not rendering until mounted
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
                <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen max-w-full overflow-x-hidden scroll-smooth">
    
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full lg:pt-8 md:pt-8 pt-8">
      {/* Header */}
      <div className=" mb-2 w-full text-center border-b-2 border-black pb-3">
        <h1 className="text-3xl font-bold mb-2">
          {filters.titleQuery || filters.keywordQuery || filters.authorQuery || filters.abstractQuery 
            ? "Search Results" 
            : "Published Research Papers"}
        </h1>
        <p className="text-muted-foreground">
          {filters.titleQuery || filters.keywordQuery || filters.authorQuery || filters.abstractQuery
            ? "Use the sidebar to refine your search with multiple criteria" 
            : "Browse and discover all published research papers. Use the sidebar to search with specific criteria."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 bg-card border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Advanced Search
                {(filters.titleQuery || filters.keywordQuery || filters.authorQuery || filters.abstractQuery) && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Search */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Search by Title</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter title keywords..."
                    value={filters.titleQuery}
                    onChange={(e) => handleFilterChange("titleQuery", e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-input"
                  />
                </div>
              </div>

              {/* Keywords Search */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Search by Keywords</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="AI, machine learning, etc."
                    value={filters.keywordQuery}
                    onChange={(e) => handleFilterChange("keywordQuery", e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-input"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
              </div>

              {/* Author Search */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Search by Author</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Author name or email..."
                    value={filters.authorQuery}
                    onChange={(e) => handleFilterChange("authorQuery", e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-input"
                  />
                </div>
              </div>

              {/* Abstract Search */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Search in Abstract</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search abstract content..."
                    value={filters.abstractQuery}
                    onChange={(e) => handleFilterChange("abstractQuery", e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-input"
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search Papers"}
              </Button>

              <Separator className="my-4" />

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Sort By
                </Label>
                <Select value={filters.sortBy} onValueChange={(value: any) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger className="border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submissionDate">📅 Submission Date</SelectItem>
                    <SelectItem value="acceptedDate">🎯 Publication Date</SelectItem>
                    <SelectItem value="title">📝 Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {filters.sortOrder === "desc" ? 
                    <SortDesc className="h-4 w-4" /> : 
                    <SortAsc className="h-4 w-4" />
                  }
                  Sort Order
                </Label>
                <Select value={filters.sortOrder} onValueChange={(value: any) => handleFilterChange("sortOrder", value)}>
                  <SelectTrigger className="border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      <div className="flex items-center">
                        <SortDesc className="h-4 w-4 mr-2" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="asc">
                      <div className="flex items-center">
                        <SortAsc className="h-4 w-4 mr-2" />
                        Oldest First
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Filter by Year
                </Label>
                <Select value={filters.yearFilter || "all"} onValueChange={(value) => handleFilterChange("yearFilter", value === "all" ? "" : value)}>
                  <SelectTrigger className="border-input">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🗓️ All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>📅 {year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({
                    titleQuery: "",
                    keywordQuery: "",
                    authorQuery: "",
                    abstractQuery: "",
                    sortBy: "submissionDate",
                    sortOrder: "desc",
                    yearFilter: "",
                  });
                  // Clear URL parameters
                  window.history.replaceState({}, "", window.location.pathname);
                  setTimeout(() => fetchPapers(true), 0);
                }}
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                size="lg"
              >
                🗑️ Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">
                {loading 
                  ? "Loading..." 
                  : `${totalResults} papers found`
                }
              </span>
            </div>
          </div>

      {/* Results */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : papers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {(filters.titleQuery || filters.keywordQuery || filters.authorQuery || filters.abstractQuery) ? "No papers found" : "No published papers"}
              </h3>
              <p className="text-muted-foreground">
                {(filters.titleQuery || filters.keywordQuery || filters.authorQuery || filters.abstractQuery) 
                  ? "Try adjusting your search terms using the navbar search or modify the filters above"
                  : "No papers have been published yet"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          papers.map((paper) => (
            <Card
              key={paper.paperId}
              className="hover:shadow-lg transition-shadow border-l-4 border-l-primary"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                <Link href={`/paper/${paper.paperId}`} >
                  <h3 
                    className="text-xl font-semibold leading-tight pr-4 cursor-pointer hover:text-primary hover:underline transition-colors"
                    
                  >
                    {paper.title}
                  </h3>
                  </Link>
                  <div className="flex items-center shrink-0 flex-col">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Published
                    </Badge>
                    {
                      paper.doi &&(
                        <Link href={`${paper.doi}`} target="_blank" rel="noopener noreferrer" className="font-normal text-black hover:text-blue-600 hover:underline duration-200 text-lg">

                      {paper.doi} </Link>
                    
                      )
                    }
                    
                  </div>
                </div>

                <div className="flex flex-row w-max justify-between items-start gap-4 text-sm text-muted-foreground mb-3">
                  {paper.contributors &&
                    (paper.contributors.length > 0 ? (
                      paper.contributors.map((contributor, index) => (
                        <NavigationMenu key={index}>
                          <NavigationMenuItem>
                            <NavigationMenuTrigger className="text-xs flex items-center gap-1 p-2">
                              <User className="h-4 w-4" />
                              <span>{contributor.fullName}</span>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="flex flex-col">
                              <div className="flex flex-col w-auto h-auto gap-1">
                                {contributor.affiliation?.split(",").map((affil, i) => (
                                  <Badge key={i} variant="default" className="flex items-center gap-2">
                                    <IconAffiliate />
                                    <span>{affil}</span>
                                  </Badge>
                                ))}
                              </div>
                            </NavigationMenuContent>
                          </NavigationMenuItem>
                        </NavigationMenu>
                      ))
                    ) : (
                      <span>No contributors found</span>
                    ))}
                </div>

                <div className="flex gap-3 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {formatDate(paper.submissionDate)}</span>
                  </div>
                  {paper.acceptedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">
                        Published: {formatDate(paper.acceptedDate)}
                      </span>
                    </div>
                  )}
                </div>

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
                    {expandedAbstracts.has(paper.paperId)
                      ? paper.abstract
                      : truncateAbstract(paper.abstract, 450)}
                  </div>
                  {paper.abstract && paper.abstract.length > 450 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleAbstract(paper.paperId)}
                      className="p-0 h-auto text-xs mt-2"
                    >
                      {expandedAbstracts.has(paper.paperId) ? (
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
          ))
        )}
      </div>

      {/* Pagination */}
      {papers.length > 0 && totalResults > 5 && (
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
        </div>
      </div>
    </div>
    
    </div>
  );
}

export default function PaperSearchPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen overflow-x-hidden scroll-smooth">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full lg:pt-8 md:pt-8 pt-8">
          <div className="mt-8 mb-2 w-full text-center border-b-2 border-black pb-3">
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
                  <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaperSearchContent />
    </Suspense>
  );
}
