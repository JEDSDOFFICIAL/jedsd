"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperReview, ResearchPaper, User } from "@prisma/client";
import { 
  FileSignature, 
  Star, 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Download,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  FileText,
  X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReviewWithDetails extends PaperReview {
  reviewer: User;
}

interface PaperWithReviews extends ResearchPaper {
  reviews: ReviewWithDetails[];
  author?: User;
}

type SortField = "title" | "paperId" | "reviewCount" | "avgRating" | "latestReview";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "MINOR_REVISION" | "MAJOR_REVISION" | "PENDING";

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<PaperWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [paperIdFilter, setPaperIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  
  // Sorting States
  const [sortField, setSortField] = useState<SortField>("latestReview");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Dialog State
  const [selectedPaper, setSelectedPaper] = useState<PaperWithReviews | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPapers = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get("/api/paper");
        const allPapers = response.data.papers || [];
        
        // Filter papers that have at least one review with text
        const papersWithReviews = allPapers.filter((paper: PaperWithReviews) => 
          paper.reviews && 
          paper.reviews.length > 0 && 
          paper.reviews.some((review: ReviewWithDetails) => 
            review.reviewText && review.reviewText.trim() !== ""
          )
        );
        
        setPapers(papersWithReviews);
      } catch (err) {
        console.error("Error fetching papers:", err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [session?.user?.email]);

  // Filter and Sort Logic
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = [...papers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.paperId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.reviews.some(review => 
          review.reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Paper ID filter
    if (paperIdFilter) {
      filtered = filtered.filter(paper =>
        paper.paperId.toLowerCase().includes(paperIdFilter.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(paper =>
        paper.reviews.some(review => review.reviewerStatus === statusFilter)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "title":
          compareValue = a.title.localeCompare(b.title);
          break;
        case "paperId":
          compareValue = a.paperId.localeCompare(b.paperId);
          break;
        case "reviewCount":
          compareValue = a.reviews.length - b.reviews.length;
          break;
        case "avgRating":
          const avgA = a.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / a.reviews.length;
          const avgB = b.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / b.reviews.length;
          compareValue = avgA - avgB;
          break;
        case "latestReview":
          const latestA = Math.max(...a.reviews.map(r => new Date(r.createdAt).getTime()));
          const latestB = Math.max(...b.reviews.map(r => new Date(r.createdAt).getTime()));
          compareValue = latestA - latestB;
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return filtered;
  }, [papers, searchTerm, paperIdFilter, statusFilter, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedPapers.length / itemsPerPage);
  const paginatedPapers = filteredAndSortedPapers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paperIdFilter, statusFilter, sortField, sortOrder, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleViewReviews = (paper: PaperWithReviews) => {
    setSelectedPaper(paper);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ACCEPTED_FOR_PUBLICATION":
        return "bg-green-100 text-green-800";
      case "REJECTED_FOR_PUBLICATION":
        return "bg-red-100 text-red-800";
      case "MINOR_REVISION":
        return "bg-blue-100 text-blue-800";
      case "MAJOR_REVISION":
        return "bg-orange-100 text-orange-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "ACCEPTED_FOR_PUBLICATION":
        return "Accept";
      case "REJECTED_FOR_PUBLICATION":
        return "Reject";
      case "MINOR_REVISION":
        return "Minor Revision";
      case "MAJOR_REVISION":
        return "Major Revision";
      case "PENDING":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-gray-500";
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    if (rating >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getAverageRating = (reviews: ReviewWithDetails[]) => {
    const validRatings = reviews.filter(r => r.rating).map(r => r.rating!);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPaperIdFilter("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || paperIdFilter || statusFilter !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSignature className="h-8 w-8" />
          Paper Reviews
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all papers with submitted reviews
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title, paper ID, reviewer, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                placeholder="Filter by Paper ID..."
                value={paperIdFilter}
                onChange={(e) => setPaperIdFilter(e.target.value)}
                className="w-[200px]"
              />
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACCEPTED_FOR_PUBLICATION">Accepted</SelectItem>
                  <SelectItem value="REJECTED_FOR_PUBLICATION">Rejected</SelectItem>
                  <SelectItem value="MINOR_REVISION">Minor Revision</SelectItem>
                  <SelectItem value="MAJOR_REVISION">Major Revision</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Papers Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Papers with Reviews ({filteredAndSortedPapers.length})</CardTitle>
              <CardDescription>
                Click on a paper to view all reviews from different reviewers
              </CardDescription>
            </div>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedPapers.length === 0 ? (
            <div className="text-center py-8">
              <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No papers found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No papers match your search criteria" : "No papers have reviews yet"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("paperId")} className="h-8 px-2">
                        Paper ID
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("title")} className="h-8 px-2">
                        Title
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("reviewCount")} className="h-8 px-2">
                        Reviews
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("avgRating")} className="h-8 px-2">
                        Avg Rating
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort("latestReview")} className="h-8 px-2">
                        Latest Review
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPapers.map((paper) => {
                    const avgRating = getAverageRating(paper.reviews);
                    const latestReview = paper.reviews.reduce((latest, review) => 
                      new Date(review.createdAt) > new Date(latest.createdAt) ? review : latest
                    );

                    return (
                      <TableRow key={paper.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewReviews(paper)}>
                        <TableCell>
                          <div className="font-mono text-sm">{paper.paperId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[400px]">
                            <div className="font-medium truncate">{paper.title}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {paper.abstract.substring(0, 80)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {paper.reviews.length} {paper.reviews.length === 1 ? "Review" : "Reviews"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 ${getRatingColor(avgRating)}`} />
                            <span className={`font-medium ${getRatingColor(avgRating)}`}>
                              {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}/10
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(latestReview.createdAt), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReviews(paper);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedPapers.length)} of{" "}
                    {filteredAndSortedPapers.length} papers
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileSignature className="h-8 w-8 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Papers</p>
                <p className="text-2xl font-bold">{papers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">
                  {papers.reduce((sum, p) => sum + p.reviews.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {papers.length > 0 
                    ? (papers.reduce((sum, p) => sum + getAverageRating(p.reviews), 0) / papers.length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="bg-green-100 text-green-800 h-8 w-8 rounded-full flex items-center justify-center p-0">
                ✓
              </Badge>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">
                  {papers.filter(p => 
                    p.reviews.some(r => r.reviewerStatus === "ACCEPTED_FOR_PUBLICATION")
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Paper Reviews</DialogTitle>
            <DialogDescription>
              {selectedPaper?.paperId} - {selectedPaper?.title}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            {selectedPaper && (
              <div className="space-y-6">
                {/* Paper Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Paper Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-semibold">Title:</span> {selectedPaper.title}
                    </div>
                    <div>
                      <span className="font-semibold">Paper ID:</span> {selectedPaper.paperId}
                    </div>
                    <div>
                      <span className="font-semibold">Abstract:</span> {selectedPaper.abstract}
                    </div>
                    <div>
                      <span className="font-semibold">Keywords:</span>{" "}
                      {selectedPaper.keywords.join(", ")}
                    </div>
                    <div>
                      <span className="font-semibold">Submitted:</span>{" "}
                      {format(new Date(selectedPaper.submissionDate), "MMMM dd, yyyy")}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Reviews ({selectedPaper.reviews.length})
                  </h3>
                  
                  {selectedPaper.reviews
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((review, index) => (
                      <Card key={review.id} className="border-2">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                Review #{index + 1} by {review.reviewer.name}
                              </CardTitle>
                              <CardDescription>
                                {review.reviewer.affiliation && `${review.reviewer.affiliation} • `}
                                {review.reviewer.email}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getStatusColor(review.reviewerStatus!)}>
                                {getStatusLabel(review.reviewerStatus!)}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className={`h-4 w-4 ${getRatingColor(review.rating!)}`} />
                                <span className={`font-medium text-sm ${getRatingColor(review.rating!)}`}>
                                  {review.rating || "N/A"}/10
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Review Text:</h4>
                            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                              {review.reviewText}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Submitted: {format(new Date(review.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                              </div>
                              {review.updatedAt !== review.createdAt && (
                                <div>
                                  Updated: {format(new Date(review.updatedAt), "MMM dd, yyyy 'at' hh:mm a")}
                                </div>
                              )}
                            </div>
                            {review.correspondingFile && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={review.correspondingFile} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download Attachment
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}