"use client";

import * as React from "react";
import { useState } from "react";

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
} from "@tabler/icons-react";
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
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AuthorOrContact } from "@/types/dataTypes";
import { PaperReview, User } from "@prisma/client";
import { fetchPapers, fetchReviewer, reviewerAllocation, reassignReviewer } from "@/lib/Frontend-actions";
import toast from "react-hot-toast";
import { ArrowUpDown, LoaderCircle, PaperclipIcon } from "lucide-react";
import axios from "axios";

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

export default function AllPapers() {
  const [paper, setPaper] = React.useState<PaperWithRelations[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [actionType, setActionType] = useState<"ASSIGN_REVIEWER" | "REASSIGN_REVIEWER" | null>(null);
  const [selectedOldReviewer, setSelectedOldReviewer] = useState<string>("");
  const [newReviewer, setNewReviewer] = useState<string>("");

  const columns: ColumnDef<PaperWithRelations>[] = [
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
          <ArrowUpDown className="ml-2 h-4 w-4 " />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="text-muted-foreground px-1.5 bg-blue-300"
      >
        <IconLoader className=" animate-spin " />
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <PaperDetailsDialog
              paperId={row.original.id}
              trigger={
                <div className="w-full px-2 py-1.5 text-sm cursor-pointer">
                  View Details
                </div>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {row.original.reviews && row.original.reviews.length > 0 ? (
            <>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedPaper(row.original);
                  setActionType("ASSIGN_REVIEWER");
                  fetchAllReviewers();
                }}
              >
                Add More Reviewers
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedPaper(row.original);
                  setActionType("REASSIGN_REVIEWER");
                  fetchAllReviewers();
                }}
              >
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
              Assign Reviewers
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

  const fetchAllReviewers = async () => {
      try {
        setLoading(true);
        const response = await fetchReviewer();
        const reviewers = response || [];
        setReviewers(reviewers);
      } catch (error) {
        console.error("Error fetching reviewers:", error);
        toast.error("Failed to fetch reviewers");
      } finally {
        setLoading(false);
      }
    };
    const handleAssignReviewers = async () => {
      if (!selectedPaper || selectedReviewers.length === 0) {
        toast.error("Please select reviewers");
        return;
      }
  
      try {
        setIsAllocating(true);
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
        fetchAllPapers(); // Refresh data
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
  const fetchAllPapers = async (page?: number, limit?: number) => {
    try {
      setLoading(true);
      const currentPage = page !== undefined ? page : pagination.pageIndex + 1; // API expects 1-based page
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
        setPaper(papers);
        setTotalCount(response.total);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  };

  const table = useReactTable<PaperWithRelations>({
    data: paper,
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

  React.useEffect(() => {
    fetchAllPapers(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  React.useEffect(() => {
    fetchAllReviewers();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header with search and column customization */}
      <div className="flex items-center justify-between px-4 lg:px-6">
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
            <div className="flex items-center justify-center h-32">
              <IconLoader className="animate-spin h-6 w-6" />
              <span className="ml-2">Loading papers...</span>
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
                      No results.
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
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "ASSIGN_REVIEWER"
                  ? selectedPaper.reviews && selectedPaper.reviews.length > 0
                    ? "Add More Reviewers"
                    : "Assign Reviewers"
                  : "Reassign Reviewers"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Paper: {selectedPaper.title}
                <br />
                {actionType === "ASSIGN_REVIEWER" 
                  ? "Select reviewers for this paper (maximum 3 reviewers total)"
                  : "Select a current reviewer to replace and choose a new reviewer"}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-4 py-4">
              {actionType === "REASSIGN_REVIEWER" && selectedPaper.reviews && selectedPaper.reviews.length > 0 && (
                <div className="grid gap-2">
                  <h4 className="font-medium">Current Reviewers</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedPaper.reviews.map((review, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedOldReviewer === review.reviewerId
                            ? "bg-red-50 border-red-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedOldReviewer(
                            selectedOldReviewer === review.reviewerId ? "" : review.reviewerId
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedOldReviewer === review.reviewerId}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.reviewer.profileImage || ""} />
                          <AvatarFallback>
                            {review.reviewer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{review.reviewer.name}</div>
                          <div className="text-sm text-gray-500">
                            {review.reviewer.email}
                          </div>
                        </div>
                        {selectedOldReviewer === review.reviewerId && (
                          <Badge variant="destructive">To be replaced</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <h4 className="font-medium">
                  {actionType === "REASSIGN_REVIEWER" ? "New Reviewer" : "Available Reviewers"}
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
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
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : isDisabled
                              ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                              : "hover:bg-gray-50"
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
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reviewer.profileImage || ""} />
                          <AvatarFallback>
                            {reviewer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{reviewer.name}</div>
                          <div className="text-sm text-gray-500">
                            {reviewer.email}
                          </div>
                          {reviewer.affiliation && (
                            <div className="text-xs text-gray-400">
                              {reviewer.affiliation}
                            </div>
                          )}
                        </div>
                        {isAlreadyAssigned && (
                          <Badge variant="secondary">Already Assigned</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {actionType === "ASSIGN_REVIEWER" && selectedReviewers.length > 0 && (
                <div className="grid gap-2">
                  <h4 className="font-medium">
                    Selected Reviewers ({selectedReviewers.length}/{3 - (selectedPaper.reviews?.length || 0)} remaining slots)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReviewers.map((reviewerId) => {
                      const reviewer = reviewers.find(
                        (r) => r.id === reviewerId
                      );
                      return reviewer ? (
                        <Badge key={reviewerId} variant="default">
                          {reviewer.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {actionType === "REASSIGN_REVIEWER" && selectedOldReviewer && newReviewer && (
                <div className="grid gap-2">
                  <h4 className="font-medium">Reassignment Summary</h4>
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        <strong>From:</strong> {reviewers.find(r => r.id === selectedOldReviewer)?.name}
                      </span>
                      <span className="text-sm">
                        <strong>To:</strong> {reviewers.find(r => r.id === newReviewer)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedPaper(null);
                setActionType(null);
                setSelectedReviewers([]);
                setSelectedOldReviewer("");
                setNewReviewer("");
              }}>
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
              >
                {isAllocating
                  ? "Processing..."
                  : actionType === "ASSIGN_REVIEWER"
                    ? "Assign Reviewers"
                    : "Reassign Reviewer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User as UserIcon,
  FileText,
  Tag,
  Clock,
  AlertCircle,
} from "lucide-react";

type PaperDetailsDialogProps = {
  paperId: string;
  trigger: React.ReactNode;
};

export function PaperDetailsDialog({
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
                      {paperDetails.keywords.map((keyword, index) => (
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