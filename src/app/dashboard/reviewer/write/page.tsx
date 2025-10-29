"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  Send,
  Upload,
  Star,
  ArrowLeft,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { fetchReviewerPapers, submitReview } from "@/lib/Frontend-actions";
import { uploadFileToFirebase } from "@/lib/Firebase-Action";
import { PaperWithRelations, PaginationInfo, ReviewFormData } from "@/types/dataTypes";
import { format } from "date-fns";

export default function WriteReviewPage() {
  const { data: session, status: sessionStatus } = useSession();
  
  // State Management
  const [papers, setPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  
  // Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Review Form States
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    reviewText: "",
    rating: 1,
    correspondingFile: null,
    reviewerStatus: "ACCEPTED_FOR_PUBLICATION",
    confidentialComments: "",
    recommendation: "ACCEPTED_FOR_PUBLICATION"
  });

  // Utility Functions
  const getUserReviewStatus = (paper: PaperWithRelations) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    return userReview?.reviewerStatus || "PENDING";
  };

  const hasSubmittedReview = (paper: PaperWithRelations) => {
    const status = getUserReviewStatus(paper);
    return status === "ACCEPTED_FOR_PUBLICATION" || status === "REJECTED_FOR_PUBLICATION";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "ACCEPTED_FOR_REVIEW":
        return "default";
      case "REJECTED_FOR_REVIEW":
        return "destructive";
      case "ACCEPTED_FOR_PUBLICATION":
        return "outline";
      case "REJECTED_FOR_PUBLICATION":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Column Definitions
  const columns: ColumnDef<PaperWithRelations>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">
            {row.original.title.length > 50
              ? `${row.original.title.slice(0, 50)}...`
              : row.original.title}
          </div>
          {row.original.keywords && (
            <div className="text-xs text-blue-600 mt-1">
              Keywords: {row.original.keywords.join(", ").length > 30 
                ? row.original.keywords.join(", ").slice(0, 30) + "..." 
                : row.original.keywords.join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.author?.name || "Unknown"}</div>
          <div className="text-muted-foreground">{row.original.author?.email || ""}</div>
        </div>
      ),
    },
    {
      accessorKey: "submissionDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("submissionDate"));
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      id: "reviewerStatus",
      header: "Review Status",
      cell: ({ row }) => {
        const status = getUserReviewStatus(row.original);
        const hasReview = hasSubmittedReview(row.original);
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={getStatusBadgeVariant(status)}>
              {hasReview ? "Review Submitted" : "Ready to Review"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const paper = row.original;
        const status = getUserReviewStatus(paper);
        const hasReview = hasSubmittedReview(paper);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Paper Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => window.open(paper.filePath, "_blank")}>
                <Eye className="mr-2 h-4 w-4" />
                View Paper
              </DropdownMenuItem>
              
              {status === "ACCEPTED_FOR_REVIEW" && !hasReview && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setReviewForm({
                      reviewText: "",
                      rating: 1,
                      correspondingFile: null,
                      reviewerStatus: "ACCEPTED_FOR_PUBLICATION",
                      confidentialComments: "",
                      recommendation: "ACCEPTED_FOR_PUBLICATION"
                    });
                    setIsReviewDialogOpen(true);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Write Review
                </DropdownMenuItem>
              )}

              {hasReview && (
                <DropdownMenuItem disabled>
                  <FileText className="mr-2 h-4 w-4" />
                  Review Already Submitted
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Data Fetching - Only fetch accepted papers
  const loadAcceptedPapers = async (page: number = 1, limit: number = 10) => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      console.log("Fetching accepted papers for reviewer ID:", session.user.id);
      const response = await fetchReviewerPapers(session.user.id, page, limit);
      if (response && response.data) {
        // Filter only papers that are accepted for review
        const acceptedPapers = response.data.filter((paper: PaperWithRelations) => {
          const status = getUserReviewStatus(paper);
          return status === "ACCEPTED_FOR_REVIEW" || hasSubmittedReview(paper);
        });
        
        setPapers(acceptedPapers);
        setPagination({
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: acceptedPapers.length,
          limit: response.limit || 10,
        });
      } else {
        setPapers([]);
        setPagination({
          page: 1,
          totalPages: 1,
          total: 0,
          limit: 10,
        });
      }
    } catch (error) {
      console.error("Error fetching accepted papers:", error);
      toast.error("Failed to load your accepted papers.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReviewForm(prev => ({ ...prev, correspondingFile: file }));
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedPaper || !session?.user?.id) {
      toast.error("Invalid session or paper data");
      return;
    }

    if (!reviewForm.reviewText.trim()) {
      toast.error("Please provide review comments");
      return;
    }

    if (!reviewForm.rating) {
      toast.error("Please provide a rating");
      return;
    }

    if (!reviewForm.reviewerStatus) {
      toast.error("Please provide a recommendation");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting review...");

    try {
      let uploadedFileUrl = null;

      if (reviewForm.correspondingFile) {
        uploadedFileUrl = await uploadFileToFirebase(
          reviewForm.correspondingFile, 
          `reviews/${selectedPaper.id}`
        );
        
        if (!uploadedFileUrl) {
          toast.error("Failed to upload file", { id: toastId });
          return;
        }
      }

      await submitReview(
        selectedPaper.id,
        session.user.id,
        reviewForm.reviewText,
        reviewForm.rating,
        reviewForm.reviewerStatus,
        uploadedFileUrl,
        () => {
          toast.success("Review submitted successfully!", { id: toastId });
          setIsReviewDialogOpen(false);
          setSelectedPaper(null);
          setReviewForm({
            reviewText: "",
            rating: 1,
            correspondingFile: null,
            reviewerStatus: "ACCEPTED_FOR_PUBLICATION",
            confidentialComments: "",
            recommendation: "ACCEPTED_FOR_PUBLICATION"
          });
          loadAcceptedPapers(pagination.page, pagination.limit);
        }
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Table Instance
  const table = useReactTable({
    data: papers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadAcceptedPapers();
    }
  }, [sessionStatus]);

  // Loading State
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-700">Loading accepted papers...</span>
      </div>
    );
  }

  // Access Control
  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in to view this page.
        </span>
      </div>
    );
  }

  // Main Render
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Write Reviews</h1>
          <p className="text-muted-foreground">
            Select an accepted paper to write your review
          </p>
        </div>
        <Button
          onClick={() => loadAcceptedPapers(pagination.page, pagination.limit)}
          variant="outline"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
            <p className="text-xs text-muted-foreground">
              Papers you've accepted for review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => !hasSubmittedReview(p)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews waiting to be written
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => hasSubmittedReview(p)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews already submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Papers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accepted Papers for Review</CardTitle>
          <CardDescription>
            Papers you've accepted for review. Click "Write Review" to submit your feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accepted papers</h3>
              <p className="text-muted-foreground text-center">
                You haven't accepted any papers for review yet. Go to the Allocated Papers page to accept assignments.
              </p>
              <Button asChild className="mt-4">
                <a href="/dashboard/reviewer/allocated">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Allocated Papers
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {table.getFilteredRowModel().rows.length} of {pagination.total} papers
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAcceptedPapers(pagination.page - 1, pagination.limit)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAcceptedPapers(pagination.page + 1, pagination.limit)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Submission Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Review</DialogTitle>
            <DialogDescription>
              Submit your review for &apos;{selectedPaper?.title}&apos;
            </DialogDescription>
          </DialogHeader>

          {selectedPaper && (
            <div className="space-y-6 py-4">
              {/* Paper Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedPaper.title}</CardTitle>
                  <CardDescription>
                    Paper ID: {selectedPaper.paperId} • Submitted: {format(new Date(selectedPaper.submissionDate), "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Abstract</h4>
                    <p className="text-sm text-muted-foreground">{selectedPaper.abstract}</p>
                  </div>
                  
                  {selectedPaper.keywords && selectedPaper.keywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPaper.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(selectedPaper.filePath, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View Paper
                    </Button>
                    {selectedPaper.coverLetterPath && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(selectedPaper.coverLetterPath!, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Cover Letter
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Review Form */}
              <div className="space-y-4">
                {/* Review Text */}
                <div>
                  <Label htmlFor="reviewText">Review Comments *</Label>
                  <Textarea
                    id="reviewText"
                    placeholder="Enter your detailed review comments..."
                    value={reviewForm.reviewText}
                    onChange={(e) => setReviewForm(prev => ({
                      ...prev,
                      reviewText: e.target.value
                    }))}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Rating */}
                <div>
                  <Label htmlFor="rating">Rating (1-5) *</Label>
                  <Select
                    value={reviewForm.rating.toString()}
                    onValueChange={(value) => setReviewForm(prev => ({
                      ...prev,
                      rating: parseInt(value)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                              ))}
                            </div>
                            {rating} Star{rating !== 1 ? 's' : ''}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Publication Decision */}
                <div>
                  <Label htmlFor="decision">Publication Decision *</Label>
                  <Select
                    value={reviewForm.reviewerStatus}
                    onValueChange={(value) => setReviewForm(prev => ({
                      ...prev,
                      reviewerStatus: value as "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION"
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACCEPTED_FOR_PUBLICATION">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Accept for Publication
                        </div>
                      </SelectItem>
                      <SelectItem value="REJECTED_FOR_PUBLICATION">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Reject for Publication
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="file">Corresponding File (Optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  {reviewForm.correspondingFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected file: {reviewForm.correspondingFile.name}
                    </p>
                  )}
                </div>

                {/* Confidential Comments */}
                <div>
                  <Label htmlFor="confidentialComments">Confidential Comments to Editor (Optional)</Label>
                  <Textarea
                    id="confidentialComments"
                    placeholder="Enter confidential comments for the editor..."
                    value={reviewForm.confidentialComments || ""}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, confidentialComments: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setSelectedPaper(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || !reviewForm.reviewText.trim()}
            >
              {submitting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}