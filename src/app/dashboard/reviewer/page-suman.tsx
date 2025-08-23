"use client";

import * as React from "react";
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
  CheckCircle,
  XCircle,
  Edit,
  Clock,
  AlertCircle,
  FileText,
  Star,
  Upload,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/dashboard/data-table";

import { fetchReviewerPapers, reviewerAcceptancy, submitReview } from "@/lib/Frontend-actions";

// Data Types
interface Paper {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  submissionDate: string;
  status: string;
  keywords?: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviews?: {
    id: string;
    reviewerId: string;
    reviewText?: string;
    rating?: number;
    reviewerStatus: string;
    correspondingFile?: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
}

interface ReviewForm {
  reviewText: string;
  rating: number;
  correspondingFile: File | null;
  reviewerStatus: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION";
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export default function ReviewerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  
  // State Management
  const [papers, setPapers] = React.useState<Paper[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  
  // Table States
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Search and Filter States
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");
  
  // Dialog States
  const [selectedPaper, setSelectedPaper] = React.useState<Paper | null>(null);
  const [reviewForm, setReviewForm] = React.useState<ReviewForm>({
    reviewText: "",
    rating: 1,
    correspondingFile: null,
    reviewerStatus: "ACCEPTED_FOR_PUBLICATION"
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

  // Utility Functions
  const getUserReviewStatus = (paper: Paper) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    return userReview?.reviewerStatus || "PENDING";
  };

  const hasSubmittedReview = (paper: Paper) => {
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

  // Column Definitions (Following Editor Dashboard Structure)
  const columns: ColumnDef<Paper>[] = [
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
          <div className="font-medium truncate">{row.getValue("title")}</div>
          {row.original.keywords && (
            <div className="text-xs text-blue-600 mt-1">
              Keywords: {row.original.keywords.map((keyword) => (
                <span key={keyword.trim()} className="mr-1">
                  {keyword.trim()},
                </span>
              ))}
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
          <div className="font-medium">{row.original.author.name}</div>
          <div className="text-muted-foreground">{row.original.author.email}</div>
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
      header: "Your Status",
      cell: ({ row }) => {
        const status = getUserReviewStatus(row.original);
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const paper = row.original;
        const status = getUserReviewStatus(paper);

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
              
              {status === "PENDING" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleReviewerAcceptance(paper.id, "ACCEPTED_FOR_REVIEW")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept for Review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReviewerAcceptance(paper.id, "REJECTED_FOR_REVIEW")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject for Review
                  </DropdownMenuItem>
                </>
              )}

              {status === "ACCEPTED_FOR_REVIEW" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setIsReviewDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Write Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Data Fetching
  const loadReviewerPapers = async (page: number = 1, limit: number = 10) => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetchReviewerPapers(page, limit);
      if (response && response.papers) {
        setPapers(response.papers);
        setPagination({
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: response.total || 0,
          limit: response.limit || 10,
        });
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error("Error fetching reviewer papers:", error);
      toast.error("Failed to load your assigned papers.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers
  const handleReviewerAcceptance = async (paperId: string, action: "ACCEPTED_FOR_REVIEW" | "REJECTED_FOR_REVIEW") => {
    if (!session?.user?.id) {
      toast.error("User not authenticated.");
      return;
    }
    
    const toastId = toast.loading(`${action === "ACCEPTED_FOR_REVIEW" ? "Accepting" : "Rejecting"} assignment...`);
    try {
      await reviewerAcceptancy(paperId, session.user.id, action, () => {
        toast.success(`Assignment ${action === "ACCEPTED_FOR_REVIEW" ? "accepted" : "rejected"}!`, { id: toastId });
        loadReviewerPapers(pagination.page, pagination.limit);
      });
    } catch (error) {
      console.error(`Error ${action === "ACCEPTED_FOR_REVIEW" ? "accepting" : "rejecting"} assignment:`, error);
      toast.error(`Failed to ${action === "ACCEPTED_FOR_REVIEW" ? "accept" : "reject"} assignment.`, { id: toastId });
    }
  };

  const handleReviewSubmission = async () => {
    if (!selectedPaper || !reviewForm.reviewText.trim() || !session?.user?.id) {
      toast.error("Please fill in all required fields and ensure you are logged in.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting review...");

    try {
      let uploadedFileUrl = null;

      if (reviewForm.correspondingFile) {
        const formData = new FormData();
        formData.append("file", reviewForm.correspondingFile);
        formData.append("path", `reviews/${selectedPaper.id}`);

        const uploadResponse = await axios.post("/api/upload", formData);
        uploadedFileUrl = uploadResponse.data.url;
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
            reviewerStatus: "ACCEPTED_FOR_PUBLICATION"
          });
          loadReviewerPapers(pagination.page, pagination.limit);
        }
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", { id: toastId });
    } finally {
      setIsSubmitting(false);
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Effects
  React.useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadReviewerPapers();
    }
  }, [sessionStatus]);

  // Loading State
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-700">Loading your dashboard...</span>
      </div>
    );
  }

  // Access Control
  if (!session || !session.user || session.user.userType === "USER") {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in as a Reviewer to view this page.
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
          <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your review assignments and submissions
          </p>
        </div>
        <Button
          onClick={() => loadReviewerPapers(pagination.page, pagination.limit)}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => getUserReviewStatus(p) === "PENDING").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Review</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => getUserReviewStatus(p) === "ACCEPTED_FOR_REVIEW").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => hasSubmittedReview(p)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Papers Table using DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Papers</CardTitle>
          <CardDescription>
            All papers assigned to you for review with advanced filtering and sorting.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Review Submission Dialog */}
      <AlertDialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Review</AlertDialogTitle>
            <AlertDialogDescription>
              Submit your review for &apos;{selectedPaper?.title}&apos;
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Review Text */}
            <div>
              <Label htmlFor="reviewText">Review Text *</Label>
              <Textarea
                id="reviewText"
                placeholder="Enter your detailed review..."
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

            {/* File Upload */}
            <div>
              <Label htmlFor="file">Corresponding File (Optional)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setReviewForm(prev => ({
                  ...prev,
                  correspondingFile: e.target.files?.[0] || null
                }))}
              />
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
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Accept for Publication
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED_FOR_PUBLICATION">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Reject for Publication
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsReviewDialogOpen(false);
              setSelectedPaper(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReviewSubmission}
              disabled={isSubmitting || !reviewForm.reviewText.trim()}
            >
              {isSubmitting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
