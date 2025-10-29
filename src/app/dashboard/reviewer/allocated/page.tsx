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
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import { fetchReviewerPapers, reviewerAcceptancy } from "@/lib/Frontend-actions";
import { PaperWithRelations, PaginationInfo } from "@/types/dataTypes";

export default function AllocatedPapersPage() {
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

  // Utility Functions
  const getUserReviewStatus = (paper: PaperWithRelations) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    return userReview?.reviewerStatus || "PENDING";
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
      header: "Your Status",
      cell: ({ row }) => {
        const status = getUserReviewStatus(row.original);
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status}
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
                    window.location.href = `/dashboard/reviewer/write?paperId=${paper.id}`;
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
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
      console.log("Fetching papers for reviewer ID:", session.user.id);
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
        setPagination({
          page: 1,
          totalPages: 1,
          total: 0,
          limit: 10,
        });
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
      loadReviewerPapers();
    }
  }, [sessionStatus]);

  // Loading State
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-700">Loading allocated papers...</span>
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
          <h1 className="text-3xl font-bold">Allocated Papers</h1>
          <p className="text-muted-foreground">
            Papers assigned to you for review - accept or reject assignments
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

      {/* Papers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Papers</CardTitle>
          <CardDescription>
            All papers assigned to you for review. Accept or reject assignments and manage your reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No papers allocated</h3>
              <p className="text-muted-foreground text-center">
                You don&apos;t have any papers assigned for review at the moment.
              </p>
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
                    onClick={() => loadReviewerPapers(pagination.page - 1, pagination.limit)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadReviewerPapers(pagination.page + 1, pagination.limit)}
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
    </div>
  );
}