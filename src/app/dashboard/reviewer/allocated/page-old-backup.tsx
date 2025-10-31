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
  Search,
  Filter,
  Download,
  SortAsc,
  Columns,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenuCheckboxItem,
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
  const [filteredPapers, setFilteredPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
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

  // Filter and search functionality
  useEffect(() => {
    let filtered = papers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(paper => {
        const status = getUserReviewStatus(paper);
        return status === statusFilter;
      });
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(paper => {
        const submissionDate = new Date(paper.submissionDate);
        const daysDiff = Math.floor((now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today":
            return daysDiff === 0;
          case "week":
            return daysDiff <= 7;
          case "month":
            return daysDiff <= 30;
          case "older":
            return daysDiff > 30;
          default:
            return true;
        }
      });
    }

    setFilteredPapers(filtered);
  }, [papers, searchTerm, statusFilter, dateFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  // Export functionality
  const exportToCSV = () => {
    const csvContent = [
      ["Title", "Author", "Status", "Submission Date", "Keywords"].join(","),
      ...filteredPapers.map(paper => [
        `"${paper.title.replace(/"/g, '""')}"`,
        `"${paper.author?.name || 'Unknown'}"`,
        `"${getUserReviewStatus(paper)}"`,
        `"${new Date(paper.submissionDate).toLocaleDateString()}"`,
        `"${paper.keywords?.join('; ') || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `allocated-papers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
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
    data: filteredPapers,
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
    initialState: {
      pagination: {
        pageSize: pagination.limit,
      },
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
      {/* Header and Controls */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Allocated Papers</h1>
            <p className="text-muted-foreground">
              Papers assigned to you for review - accept or reject assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              disabled={filteredPapers.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
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
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-2 items-center max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers, authors, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED_FOR_REVIEW">Accepted</SelectItem>
                <SelectItem value="REJECTED_FOR_REVIEW">Rejected</SelectItem>
                <SelectItem value="ACCEPTED_FOR_PUBLICATION">Reviewed - Accept</SelectItem>
                <SelectItem value="REJECTED_FOR_PUBLICATION">Reviewed - Reject</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="older">Older</SelectItem>
              </SelectContent>
            </Select>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredPapers.length} of {papers.length} papers
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          <div className="flex gap-4">
            <span>Pending: {filteredPapers.filter(p => getUserReviewStatus(p) === "PENDING").length}</span>
            <span>Accepted: {filteredPapers.filter(p => getUserReviewStatus(p) === "ACCEPTED_FOR_REVIEW").length}</span>
            <span>Completed: {filteredPapers.filter(p => 
              ["ACCEPTED_FOR_PUBLICATION", "REJECTED_FOR_PUBLICATION"].includes(getUserReviewStatus(p))
            ).length}</span>
          </div>
        </div>
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
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">No papers allocated</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You don&apos;t have any papers assigned for review at the moment. 
                Check back later or contact your editor if you expect assignments.
              </p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Filter className="h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">No papers found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                No papers match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
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
              </div>

              {/* Enhanced Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 20, 30, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      <SortAsc className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      ‹
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      ›
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to last page</span>
                      <SortAsc className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}