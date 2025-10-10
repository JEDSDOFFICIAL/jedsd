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
  LoaderCircle,
  PaperclipIcon,
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
import { uploadFileToFirebase } from "@/lib/Firebase-Action";

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
  const [papers, setPapers] = React.useState<PaperWithRelations[]>([]);
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
  const [selectedPaper, setSelectedPaper] = React.useState<PaperWithRelations | null>(null);
  const [reviewForm, setReviewForm] = React.useState<ReviewForm>({
    reviewText: "",
    rating: 1,
    correspondingFile: null,
    reviewerStatus: "ACCEPTED_FOR_PUBLICATION"
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

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

  // Column Definitions (Following Editor Dashboard Structure)
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
          <div className="font-medium truncate">{<PaperDetailsDialog
                  paperId={row.original.id}
                  trigger={
                    <Button
                      variant="link"
                      className="p-0 m-0 min-h-0 min-w-0 align-baseline text-primary cursor-pointer"
                    >
                      {row.original.title.length > 25
                        ? `${row.original.title.slice(0, 25)}...`
                        : row.original.title}
                    </Button>
                  }
                />}</div>
          {row.original.keywords && (
            <div className="text-xs text-blue-600 mt-1">
              Keywords: {row.original.keywords.join(", ").length > 30 ? row.original.keywords.join(", ").slice(0, 30) + "..." : row.original.keywords.join(", ")}
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
            {row.original.reviews && row.original.reviews.length > 0 ? row.original.reviews.find((review) => review.reviewerId === session?.user.id)?.reviewerStatus : "PENDING"}
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
      console.log("session id is: ", session.user.id);
      const response = await fetchReviewerPapers(session.user.id, page, limit);
      if (response && response.data) {
        setPapers(response.data);
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
      console.log("Papers loaded:", papers);
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

import { User } from "@prisma/client";

// Extended interface to include relations
interface PaperReviewWithReviewer extends PaperReview {
  reviewer: User;
}

interface PaperWithRelations {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  rating: number | null;
  coverLetterPath: string | null;
  submissionDate: Date;
  lastUpdated: Date;
  acceptedDate: Date | null;
  status: string;
  authorId: string | null;
  contributors: AuthorOrContact[];
  pointOfContact: AuthorOrContact;
  reviews: PaperReviewWithReviewer[];
  author: User;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {

  User as UserIcon,
  Tag,

} from "lucide-react";
import { PaperReview } from "@prisma/client";
import { AuthorOrContact } from "@/types/dataTypes";

type PaperDetailsDialogProps = {
  paperId: string;
  trigger: React.ReactNode;
};

function PaperDetailsDialog({
  paperId,
  trigger,
}: PaperDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [paperDetails, setPaperDetails] =
    React.useState<PaperWithRelations | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPaperDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/paper/${paperId}`);
      console.log("API Response:", response.data.paper);
      setPaperDetails(response.data.paper);
    } catch (error) {
      console.error("Error fetching paper details:", error);
      setError("Failed to load paper details");
      setPaperDetails(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && paperId) fetchPaperDetails();
  }, [open, paperId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-6xl max-w-screen bg-blue-100/30 backdrop-blur-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5 text-blue-600" />
            Paper Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 h-[70vh] scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <LoaderCircle className="animate-spin h-8 w-8 text-blue-600" />
              <p className="text-muted-foreground">Loading paper details...</p>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          ) : paperDetails ? (
            <div className="space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg leading-relaxed font-semibold">
                    <span className="flex items-center">
                      <FileText className="h-5 w-5 inline mr-2 text-green-600" />
                      Title:
                    </span>
                    {paperDetails.title}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Abstract */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="h-4 w-4" />
                    Abstract
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {paperDetails.abstract}
                  </p>
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Tag className="h-4 w-4" />
                      Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {paperDetails.keywords?.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        paperDetails.status === "PUBLISHED"
                          ? "default"
                          : "secondary"
                      }
                      className="text-sm px-3 py-1"
                    >
                      {paperDetails.status}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Submission Date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Calendar className="h-4 w-4" />
                      Submission Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(paperDetails.submissionDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <UserIcon className="h-4 w-4" />
                    Point of Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {paperDetails.pointOfContact.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {paperDetails.pointOfContact.email}
                    </p>
                    {paperDetails.pointOfContact.affiliation && (
                      <p className="text-sm text-muted-foreground">
                        {paperDetails.pointOfContact.affiliation}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contributors */}
              {paperDetails.contributors &&
                paperDetails.contributors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <UserIcon className="h-4 w-4" />
                        Contributors ({paperDetails.contributors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paperDetails.contributors.map((contributor, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg bg-muted/30"
                          >
                            <p className="font-medium text-sm">
                              {contributor.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contributor.email}
                            </p>
                            {contributor.affiliation && (
                              <p className="text-xs text-muted-foreground">
                                {contributor.affiliation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800">No paper details available.</p>
              </CardContent>
            </Card>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end gap-3 px-6 pb-6">
          {paperDetails && (
            <div className="flex flex-col sm:flex-row gap-2 mr-auto">
              <Button
                onClick={() => window.open(paperDetails.filePath, "_blank")}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Paper
              </Button>
              {paperDetails.coverLetterPath && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(paperDetails.coverLetterPath!, "_blank")
                  }
                  className=""
                >
                  <PaperclipIcon className="h-4 w-4 mr-2" />
                  View Cover Letter
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}