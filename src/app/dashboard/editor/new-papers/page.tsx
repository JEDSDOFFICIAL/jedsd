"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ResearchPaper, PaperReview, User } from "@prisma/client";
import { 
  FileText, 
  Eye, 
  Users, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  MoreHorizontal,
  ArrowRight,
  CheckCheck,
  X,
} from "lucide-react";
import { PaperDetailsDialog } from "@/components/PaperDetailsDialog";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { 
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
} from "@tabler/icons-react";
import { fetchPapers, fetchReviewer, reviewerAllocation, reassignReviewer } from "@/lib/Frontend-actions";
import toast from "react-hot-toast";
import { AuthorOrContact } from "@/types/dataTypes";

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

export default function NewPapersPage() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [loadingPaperDetails, setLoadingPaperDetails] = useState(false);
  const [assigningPaperId, setAssigningPaperId] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [actionType, setActionType] = useState<"ASSIGN_REVIEWER" | "REASSIGN_REVIEWER" | null>(null);
  const [selectedOldReviewer, setSelectedOldReviewer] = useState<string>("");
  const [newReviewer, setNewReviewer] = useState<string>("");

  const columns: ColumnDef<PaperWithRelations>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <PaperDetailsDialog
          paperId={row.original.id}
          trigger={
            <Button
              variant="link"
              className="p-0 m-0 min-h-0 min-w-0 align-baseline text-primary"
            >
              {row.original.title.length > 25
                ? `${row.original.title.slice(0, 25)}...`
                : row.original.title}
            </Button>
          }
        />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "keywords",
      header: "Keywords",
      cell: ({ row }) => {
        return (
          <div className="max-w-sm lg:max-w-md">
            <div className="font-medium">
              {row.original.keywords.join(", ").length > 30
                ? `${row.original.keywords.join(", ").slice(0, 30)}...`
                : row.original.keywords.join(", ")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "pointOfContact",
      header: "Point of Contact",
      cell: ({ row }) => {
        return (
          <div className="max-w-sm lg:max-w-md">
            <div className="font-medium">
              {row.original.pointOfContact.fullName}
            </div>
            <div className="text-sm text-muted-foreground">
              {row.original.pointOfContact.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "reviews",
      header: "Current Reviewers",
      cell: ({ row }) => {
        const reviews = row.original.reviews || [];
        if (reviews.length === 0) {
          return <Badge variant="outline" className="text-muted-foreground">No reviewers assigned</Badge>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {reviews.map((review, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {review.reviewer.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-left justify-start font-medium"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="text-muted-foreground px-1.5 bg-blue-300"
        >
          <IconLoader className="animate-spin" />
          <p className="text-black">{row.original.status}</p>
        </Badge>
      ),
    },
    {
      accessorKey: "submissionDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-left justify-start font-medium"
          >
            Submission Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("submissionDate") as Date;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Read Paper Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(row.original.filePath, "_blank")}
              className="h-8 px-2"
              title="Read Manuscript"
            >
              <FileText className="h-3 w-3" />
            </Button>
            
            {/* Read Cover Letter Button */}
            {row.original.coverLetterPath && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(row.original.coverLetterPath!, "_blank")}
                className="h-8 px-2"
                title="Read Cover Letter"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}

            {/* Assign Reviewers Button */}
            <Button
              variant={row.original.reviews && row.original.reviews.length > 0 ? "secondary" : "default"}
              size="sm"
              onClick={() => {
                setSelectedPaper(row.original);
                setActionType("ASSIGN_REVIEWER");
                fetchAllReviewers();
              }}
              className="h-8 px-2"
              title={row.original.reviews && row.original.reviews.length > 0 ? "Add More Reviewers" : "Assign Reviewers"}
              disabled={isAllocating && assigningPaperId === row.original.id}
            >
              {isAllocating && assigningPaperId === row.original.id ? (
                <IconLoader className="h-3 w-3 animate-spin" />
              ) : (
                <Users className="h-3 w-3" />
              )}
              {row.original.reviews && row.original.reviews.length > 0 && !isAllocating && (
                <span className="ml-1 text-xs">{row.original.reviews.length}</span>
              )}
            </Button>
          </div>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground h-8 w-8 p-0"
                size="icon"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <PaperDetailsDialog
                  paperId={row.original.id}
                  trigger={
                    <div className="w-full px-2 py-1.5 text-sm cursor-pointer flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      View Full Details
                    </div>
                  }
                />
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Document Actions */}
              <DropdownMenuItem 
                onClick={() => window.open(row.original.filePath, "_blank")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Open Manuscript
              </DropdownMenuItem>
              
              {row.original.coverLetterPath && (
                <DropdownMenuItem 
                  onClick={() => window.open(row.original.coverLetterPath!, "_blank")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Open Cover Letter
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Reviewer Management */}
              {row.original.reviews && row.original.reviews.length > 0 ? (
                <>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedPaper(row.original);
                      setActionType("ASSIGN_REVIEWER");
                      fetchAllReviewers();
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add More Reviewers
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedPaper(row.original);
                      setActionType("REASSIGN_REVIEWER");
                      fetchAllReviewers();
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Reassign Reviewers
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedPaper(row.original);
                    setActionType("ASSIGN_REVIEWER");
                    fetchAllReviewers();
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Assign Reviewers
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Other Actions */}
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/editor/paper-action?paperId=${row.original.id}`}
                  className="flex items-center w-full"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Paper Actions
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], []);

  const fetchAllPapers = async (page?: number, limit?: number) => {
    try {
      setLoading(true);
      const currentPage = page !== undefined ? page : pagination.pageIndex + 1;
      const currentLimit = limit !== undefined ? limit : pagination.pageSize;

      const response = await fetchPapers({
        page: currentPage,
        limit: currentLimit,
        status: "UPLOAD",
      });

      if (response) {
        const papers = (response.papers || []).map((paper: any) => ({
          ...paper,
          reviews: paper.reviews ?? [],
        }));
        setPapers(papers);
        setTotalCount(response.total);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching new papers:", error);
      setError("Failed to load new papers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReviewers = async () => {
    try {
      setLoadingReviewers(true);
      const response = await fetchReviewer();
      const reviewers = response || [];
      setReviewers(reviewers);
    } catch (error) {
      console.error("Error fetching reviewers:", error);
      toast.error("Failed to fetch reviewers");
    } finally {
      setLoadingReviewers(false);
    }
  };

  const handleAssignReviewers = async () => {
    if (!selectedPaper || selectedReviewers.length === 0) {
      toast.error("Please select reviewers");
      return;
    }

    try {
      setIsAllocating(true);
      setAssigningPaperId(selectedPaper.id);
      await reviewerAllocation(selectedPaper.id, selectedReviewers, () => {
        toast.success("Reviewers assigned successfully");
        fetchAllPapers();
        setSelectedPaper(null);
        setActionType(null);
        setSelectedReviewers([]);
      });
    } catch (error) {
      toast.error("Failed to assign reviewers");
    } finally {
      setIsAllocating(false);
      setAssigningPaperId(null);
    }
  };

  const handleReassignReviewers = async (
    selectedPaperId: string, 
    oldReviewerId: string, 
    newReviewerId: string
  ) => {
    try {
      setIsAllocating(true);
      await reassignReviewer(selectedPaperId, oldReviewerId, newReviewerId);
      toast.success("Reviewer reassigned successfully");
      fetchAllPapers();
      setSelectedPaper(null);
      setActionType(null);
      setSelectedOldReviewer("");
      setNewReviewer("");
      setSelectedReviewers([]);
    } catch (error) {
      toast.error("Failed to reassign reviewers");
    } finally {
      setIsAllocating(false);
    }
  };

  const table = useReactTable<PaperWithRelations>({
    data: papers,
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      pagination,
      columnVisibility,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    manualPagination: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    fetchAllPapers(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchAllReviewers();
  }, []);

  // Listen for reviewer assignment events from the paper details dialog
  useEffect(() => {
    const handleAssignReviewers = (event: CustomEvent) => {
      const { paper } = event.detail;
      setSelectedPaper(paper);
      setActionType("ASSIGN_REVIEWER");
      fetchAllReviewers();
    };

    window.addEventListener('assignReviewers', handleAssignReviewers as EventListener);
    return () => {
      window.removeEventListener('assignReviewers', handleAssignReviewers as EventListener);
    };
  }, []);

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
        <h1 className="text-3xl font-bold">New Papers</h1>
        <p className="text-muted-foreground mt-2">
          Recently submitted manuscripts requiring editorial action
        </p>
      </div>

      {/* Header with search and column customization */}
      <div className="flex items-center justify-between px-4 lg:px-6 mb-6">
        <Input
          placeholder="Search by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="md:w-md w-sm lg:w-lg"
        />

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
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
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table content */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          {loading ? (
            <div className="p-4">
              <div className="space-y-4">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                  <Skeleton className="h-10 w-40" />
                </div>
                
                {/* Table skeleton */}
                <div className="border rounded-lg">
                  <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
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
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No new papers</h3>
                        <p className="text-muted-foreground text-center">
                          There are no new paper submissions at the moment.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            <div className="flex flex-col gap-1">
              <div>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {totalCount} row(s) selected.
              </div>
              <div className="text-xs">
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  totalCount
                )}{" "}
                of {totalCount} entries
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {totalPages || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex((totalPages || 1) - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Assignment Dialog */}
      {selectedPaper && actionType && (
        <AlertDialog
          open={!!selectedPaper}
          onOpenChange={() => {
            setSelectedPaper(null);
            setActionType(null);
            setSelectedReviewers([]);
          }}
        >
          <AlertDialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-blue-600" />
                {actionType === "ASSIGN_REVIEWER"
                  ? selectedPaper.reviews && selectedPaper.reviews.length > 0
                    ? "Add More Reviewers"
                    : "Assign Reviewers"
                  : "Reassign Reviewers"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">
                    Paper: {selectedPaper.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {actionType === "ASSIGN_REVIEWER" 
                      ? "Select reviewers for this paper (maximum 3 reviewers total)"
                      : "Select a current reviewer to replace and choose a new reviewer"}
                  </div>
                  {selectedPaper.reviews && selectedPaper.reviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium">Currently assigned:</span>
                      <div className="flex gap-1">
                        {selectedPaper.reviews.map((review, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {review.reviewer.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-6 py-4">
              {actionType === "REASSIGN_REVIEWER" && selectedPaper.reviews && selectedPaper.reviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />
                    Select Reviewer to Replace
                  </h4>
                  <div className="grid grid-cols-1 gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    {selectedPaper.reviews.map((review, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedOldReviewer === review.reviewerId
                            ? "bg-red-100 border-red-300 shadow-sm"
                            : "bg-white border-gray-200 hover:bg-red-50"
                        }`}
                        onClick={() => {
                          setSelectedOldReviewer(
                            selectedOldReviewer === review.reviewerId ? "" : review.reviewerId
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedOldReviewer === review.reviewerId}
                          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewer.profileImage || ""} />
                          <AvatarFallback className="bg-red-100 text-red-700">
                            {review.reviewer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{review.reviewer.name}</div>
                          <div className="text-sm text-gray-500">{review.reviewer.email}</div>
                          {review.reviewer.affiliation && (
                            <div className="text-xs text-gray-400">{review.reviewer.affiliation}</div>
                          )}
                        </div>
                        {selectedOldReviewer === review.reviewerId && (
                          <Badge variant="destructive" className="animate-pulse">
                            To be replaced
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  {actionType === "REASSIGN_REVIEWER" ? "Select New Reviewer" : "Available Reviewers"}
                  <span className="text-sm font-normal text-gray-500">
                    ({reviewers.length} total reviewers)
                  </span>
                </h4>
                
                {/* Reviewer Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {actionType === "ASSIGN_REVIEWER" ? selectedReviewers.length : (newReviewer ? 1 : 0)}
                    </div>
                    <div className="text-xs text-blue-600">Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {actionType === "ASSIGN_REVIEWER" 
                        ? (3 - (selectedPaper.reviews?.length || 0) - selectedReviewers.length)
                        : (newReviewer ? 0 : 1)
                      }
                    </div>
                    <div className="text-xs text-green-600">Remaining Slots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {selectedPaper.reviews?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Currently Assigned</div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border">
                  {loadingReviewers ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center p-3 border rounded-lg bg-white">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3 flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <div className="flex gap-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                    {reviewers.map((reviewer) => {
                      const isSelected = actionType === "REASSIGN_REVIEWER" 
                        ? newReviewer === reviewer.id
                        : selectedReviewers.includes(reviewer.id);
                      const isAlreadyAssigned = selectedPaper.reviews?.some(
                        (review) => review.reviewerId === reviewer.id
                      );
                      const isDisabled = actionType === "ASSIGN_REVIEWER" 
                        ? (!isSelected && (selectedReviewers.length + (selectedPaper.reviews?.length || 0)) >= 3)
                        : false;

                      return (
                        <div
                          key={reviewer.id}
                          className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-green-100 border-green-300 shadow-sm"
                              : isDisabled
                                ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                                : isAlreadyAssigned
                                  ? "bg-yellow-50 border-yellow-200 cursor-not-allowed"
                                  : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                          }`}
                          onClick={() => {
                            if (!isDisabled && !isAlreadyAssigned) {
                              if (actionType === "REASSIGN_REVIEWER") {
                                setNewReviewer(isSelected ? "" : reviewer.id);
                              } else {
                                setSelectedReviewers((prev) =>
                                  isSelected
                                    ? prev.filter((id) => id !== reviewer.id)
                                    : [...prev, reviewer.id]
                                );
                              }
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled || isAlreadyAssigned}
                            className={`${isSelected ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : ''}`}
                          />
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={reviewer.profileImage || ""} />
                            <AvatarFallback className={`${isSelected ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {reviewer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{reviewer.name}</div>
                            <div className="text-sm text-gray-600">{reviewer.email}</div>
                            {reviewer.affiliation && (
                              <div className="text-xs text-gray-500 mt-1">{reviewer.affiliation}</div>
                            )}
                            {reviewer.areaOfInterest && reviewer.areaOfInterest.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {reviewer.areaOfInterest.slice(0, 3).map((exp, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {exp}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {isAlreadyAssigned && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Already Assigned
                            </Badge>
                          )}
                          {isSelected && !isAlreadyAssigned && (
                            <Badge variant="default" className="bg-green-600 animate-pulse">
                              Selected
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              </div>

              {actionType === "ASSIGN_REVIEWER" && selectedReviewers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCheck className="h-4 w-4 text-green-600" />
                    Selected Reviewers 
                    <Badge variant="default" className="bg-green-600">
                      {selectedReviewers.length}/{3 - (selectedPaper.reviews?.length || 0)}
                    </Badge>
                  </h4>
                  <div className="flex flex-wrap gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    {selectedReviewers.map((reviewerId) => {
                      const reviewer = reviewers.find((r) => r.id === reviewerId);
                      return reviewer ? (
                        <div key={reviewerId} className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reviewer.profileImage || ""} />
                            <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                              {reviewer.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{reviewer.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => setSelectedReviewers(prev => prev.filter(id => id !== reviewerId))}
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {actionType === "REASSIGN_REVIEWER" && selectedOldReviewer && newReviewer && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    Reassignment Summary
                  </h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-green-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="font-medium text-red-700">Removing</div>
                          <div className="text-sm">{reviewers.find(r => r.id === selectedOldReviewer)?.name}</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <div className="text-center">
                          <div className="font-medium text-green-700">Adding</div>
                          <div className="text-sm">{reviewers.find(r => r.id === newReviewer)?.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter className="flex justify-between items-center px-6 py-4 bg-gray-50">
              <div className="flex items-center text-sm text-gray-600">
                {actionType === "ASSIGN_REVIEWER" && (
                  <span>
                    {selectedReviewers.length > 0 
                      ? `${selectedReviewers.length} reviewer${selectedReviewers.length > 1 ? 's' : ''} selected`
                      : "Please select at least one reviewer"
                    }
                  </span>
                )}
                {actionType === "REASSIGN_REVIEWER" && (
                  <span>
                    {selectedOldReviewer && newReviewer 
                      ? "Ready to reassign reviewer"
                      : "Please select both reviewers"
                    }
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <AlertDialogCancel 
                  onClick={() => {
                    setSelectedPaper(null);
                    setActionType(null);
                    setSelectedReviewers([]);
                    setSelectedOldReviewer("");
                    setNewReviewer("");
                  }}
                  className="px-6"
                >
                  Cancel
                </AlertDialogCancel>
                
                <AlertDialogAction
                  onClick={() => {
                    if (actionType === "ASSIGN_REVIEWER") {
                      handleAssignReviewers();
                    } else if (actionType === "REASSIGN_REVIEWER" && selectedOldReviewer && newReviewer) {
                      handleReassignReviewers(selectedPaper.id, selectedOldReviewer, newReviewer);
                    }
                  }}
                  disabled={
                    (actionType === "ASSIGN_REVIEWER" && selectedReviewers.length === 0) ||
                    (actionType === "REASSIGN_REVIEWER" && (!selectedOldReviewer || !newReviewer)) ||
                    isAllocating
                  }
                  className={`px-6 ${
                    (actionType === "ASSIGN_REVIEWER" && selectedReviewers.length > 0) ||
                    (actionType === "REASSIGN_REVIEWER" && selectedOldReviewer && newReviewer)
                      ? "bg-green-600 hover:bg-green-700" 
                      : ""
                  }`}
                >
                  {isAllocating ? (
                    <div className="flex items-center gap-2">
                      <IconLoader className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {actionType === "ASSIGN_REVIEWER"
                        ? `Assign ${selectedReviewers.length} Reviewer${selectedReviewers.length !== 1 ? 's' : ''}`
                        : "Reassign Reviewer"}
                    </div>
                  )}
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}