"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  RefreshCw,
  MoreHorizontal,
  CheckCheck,
  BookCheck,
  ArrowBigUp,
  ArrowBigDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  UserPlus,
  UserX,
  AlertCircle,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { ResearchPaper, PaperReview, User } from "@prisma/client";
import {
  fetchPapers,
  updatePaper,
  acceptPaper,
  rejectPaper,
  fetchPaperReviews,
} from "@/lib/Frontend-actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { IconCloud } from "@tabler/icons-react";
import { AuthorOrContact } from "@/types/dataTypes";
import ReviewerAssignmentDialog from "@/components/ReviewerAssignmentDialog";

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

export default function AllocatedPapersPage() {
  const [allocatedPapers, setAllocatedPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<"assign" | "reassign">("assign");
  const [reviewerToReassign, setReviewerToReassign] = useState<PaperReviewWithReviewer | null>(null);

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchAllocatedPapers();
  }, []);

  const fetchAllocatedPapers = async () => {
    try {
      setLoading(true);
      const response = await fetchPapers();
      const papers = (response?.papers || []).map((paper: any) => ({
        ...paper,
        reviews: paper.reviews ?? [],
      }));
      
      // Filter papers that have at least one reviewer assigned
      const allocated = papers.filter(paper => 
        paper.reviews && paper.reviews.length > 0
      );
      setAllocatedPapers(allocated);
    } catch (error) {
      console.error("Error fetching allocated papers:", error);
      toast.error("Failed to fetch allocated papers");
    } finally {
      setLoading(false);
    }
  };

  const handleReassignReviewer = (paper: PaperWithRelations, reviewer: PaperReviewWithReviewer) => {
    setSelectedPaper(paper);
    setReviewerToReassign(reviewer);
    setAssignmentMode("reassign");
    setAssignmentDialogOpen(true);
  };

  const handleAssignMoreReviewers = (paper: PaperWithRelations) => {
    setSelectedPaper(paper);
    setReviewerToReassign(null);
    setAssignmentMode("assign");
    setAssignmentDialogOpen(true);
  };

  const getReviewerStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED_FOR_REVIEW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED_FOR_REVIEW':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACCEPTED_FOR_PUBLICATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED_FOR_PUBLICATION':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReviewerStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED_FOR_REVIEW':
        return <CheckCheck className="h-3 w-3" />;
      case 'REJECTED_FOR_REVIEW':
        return <UserX className="h-3 w-3" />;
      case 'ACCEPTED_FOR_PUBLICATION':
        return <ArrowBigUp className="h-3 w-3" />;
      case 'REJECTED_FOR_PUBLICATION':
        return <ArrowBigDown className="h-3 w-3" />;
      case 'PENDING':
        return <Clock className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const hasCompletedReviews = (paper: PaperWithRelations) => {
    return paper.reviews.some(review => 
      review.reviewerStatus === 'ACCEPTED_FOR_PUBLICATION' || 
      review.reviewerStatus === 'REJECTED_FOR_PUBLICATION'
    );
  };

  const columns: ColumnDef<PaperWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 text-left justify-start font-medium"
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <div className="font-medium">
              {(row.getValue("title") as string).length > 40
                ? (row.getValue("title") as string).slice(0, 40) + "..."
                : (row.getValue("title") as string)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "author",
        header: () => <div className="text-left">Author</div>,
        cell: ({ row }) => {
          const author = row.original.author;
          return (
            <div className="text-sm">{author ? author.name : "Unknown"}</div>
          );
        },
      },
      {
        id: "reviewers",
        header: () => <div className="text-left">Reviewers & Status</div>,
        cell: ({ row }) => {
          const paper = row.original;
          const reviews = paper.reviews || [];
          const reviewCount = reviews.length;
          
          return (
            <div className="space-y-2">
              {/* Reviewer Assignment Status */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {reviewCount}/3 Assigned
                </Badge>
                {reviewCount < 3 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleAssignMoreReviewers(paper)}
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assign more reviewers</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Current Reviewers */}
              <div className="space-y-1">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex items-center justify-between">
                    {reviews[index] ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {reviews[index].reviewer.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge 
                              className={`text-xs px-1 py-0 ${getReviewerStatusColor(reviews[index].reviewerStatus || 'PENDING')}`}
                            >
                              <span className="flex items-center gap-1">
                                {getReviewerStatusIcon(reviews[index].reviewerStatus || 'PENDING')}
                                {reviews[index].reviewerStatus || 'PENDING'}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        {reviews[index].reviewerStatus === 'REJECTED_FOR_REVIEW' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-5 w-5 p-0"
                                  onClick={() => handleReassignReviewer(paper, reviews[index])}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reassign this reviewer</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-gray-400">
                        <Users className="h-3 w-3 mr-1" />
                        Reviewer {index + 1}: Not Assigned
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Review Progress Indicator */}
              {hasCompletedReviews(paper) && (
                <Badge variant="default" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Reviews Available
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "paperStatus",
        header: () => <div className="text-left">Paper Status</div>,
        cell: ({ row }) => {
          return (
            <div className="text-sm mx-auto">
              <Badge>{row.original.status}</Badge>
            </div>
          );
        },
      },
      {
        id: "pocEmail",
        header: () => <div className="text-left">Point-of-Contact Email</div>,
        cell: ({ row }) => {
          return (
            <div className="text-sm mx-auto">
              {row.original.pointOfContact?.email}
            </div>
          );
        },
      },
      {
        accessorKey: "submissionDate",
        header: () => <div className="text-left">Submitted</div>,
        cell: ({ row }) => {
          const date = new Date(row.getValue("submissionDate"));
          return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const paper = row.original;
          const reviews = paper.reviews || [];
          const hasReviews = hasCompletedReviews(paper);
          const needsMoreReviewers = reviews.length < 3;
          const hasRejectedReviewers = reviews.some(r => r.reviewerStatus === 'REJECTED_FOR_REVIEW');
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Paper Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Link
                    href={`/paper/${row.original.id}`}
                    className="flex flex-row gap-2 text-sm w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Paper Details
                  </Link>
                </DropdownMenuItem>

                {hasReviews && (
                  <DropdownMenuItem>
                    <Link
                      href={`/review/${paper.id}`}
                      className="flex flex-row gap-2 text-sm w-full"
                    >
                      <BookCheck className="mr-2 h-4 w-4" />
                      Read Reviews
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                
                {needsMoreReviewers && (
                  <DropdownMenuItem 
                    onClick={() => handleAssignMoreReviewers(paper)}
                    className="text-blue-600"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign More Reviewers ({reviews.length}/3)
                  </DropdownMenuItem>
                )}

                {hasRejectedReviewers && (
                  <DropdownMenuItem 
                    onClick={() => {
                      const rejectedReviewer = reviews.find(r => r.reviewerStatus === 'REJECTED_FOR_REVIEW');
                      if (rejectedReviewer) {
                        handleReassignReviewer(paper, rejectedReviewer);
                      }
                    }}
                    className="text-orange-600"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reassign Rejected Reviewer
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: allocatedPapers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading allocated papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Allocated Papers</h1>
        <p className="text-muted-foreground mt-2">
          Papers with allocated reviewers - manage reviewers, view reviews, and make editorial decisions
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="flex items-center justify-between space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchAllocatedPapers}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {allocatedPapers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No allocated papers</h3>
            <p className="text-muted-foreground text-center">
              There are no papers with allocated reviewers at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of {allocatedPapers.length} papers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Page</span>
                <span className="text-sm font-medium">
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Reviewer Assignment Dialog */}
      {selectedPaper && (
        <ReviewerAssignmentDialog
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          paperId={selectedPaper.id}
          paperTitle={selectedPaper.title}
          currentReviewers={selectedPaper.reviews.map(review => ({
            ...review,
            reviewerStatus: review.reviewerStatus || 'PENDING'
          }))}
          onSuccess={fetchAllocatedPapers}
          mode={assignmentMode}
          reviewerToReassign={reviewerToReassign ? {
            ...reviewerToReassign,
            reviewerStatus: reviewerToReassign.reviewerStatus || 'PENDING'
          } : undefined}
        />
      )}
    </div>
  );
}