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
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import { ResearchPaper, PaperReview, User } from "@prisma/client";
import {
  fetchPapers,
  publishPaper,
} from "@/lib/Frontend-actions";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
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

export default function FinalDecisionPage() {
  const [finalPapers, setFinalPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchFinalPapers();
  }, []);

  const fetchFinalPapers = async () => {
    try {
      setLoading(true);
      const response = await fetchPapers();
      const papers = (response?.papers || []).map((paper: any) => ({
        ...paper,
        reviews: paper.reviews ?? [],
      }));
      
      // Filter papers that are ready for final decision (EDITOR_DECISION, ACCEPTED, REJECTED, PUBLISH)
      const finalStatuses = ['EDITOR_DECISION', 'ACCEPTED', 'REJECTED', 'PUBLISH'];
      const final = papers.filter(paper => 
        finalStatuses.includes(paper.status)
      );
      setFinalPapers(final);
    } catch (error) {
      console.error("Error fetching final papers:", error);
      toast.error("Failed to fetch final papers");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPaper = async (paperId: string) => {
    try {
      await publishPaper(paperId);
      toast.success("Paper published successfully");
      fetchFinalPapers(); // Refresh data
    } catch (error) {
      toast.error("Failed to publish paper");
    }
  };

  const columns: ColumnDef<PaperWithRelations>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: () => <div className="text-left">Title</div>,
        cell: ({ row }) => (
          <div className="max-w-[250px]">
            <div className="font-medium">
              {(row.getValue("title") as string).length > 50
                ? (row.getValue("title") as string).slice(0, 50) + "..."
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
            <div className="text-sm">
              {author ? author.name : "Unknown"}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <div className="text-left">Status</div>,
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge 
              variant={
                status === "PUBLISH" ? "default" :
                status === "ACCEPTED" ? "secondary" :
                status === "REJECTED" ? "destructive" :
                status === "EDITOR_DECISION" ? "outline" :
                "outline"
              }
            >
              {status.replace(/_/g, " ").toLowerCase()}
            </Badge>
          );
        },
      },
      {
        accessorKey: "submissionDate",
        header: () => <div className="text-left">Submitted</div>,
        cell: ({ row }) => {
          const date = new Date(row.getValue("submissionDate"));
          return (
            <div className="text-sm">
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
      {
        accessorKey: "acceptedDate",
        header: () => <div className="text-left">Accepted</div>,
        cell: ({ row }) => {
          const date = row.getValue("acceptedDate") as Date | null;
          return (
            <div className="text-sm">
              {date ? new Date(date).toLocaleDateString() : "N/A"}
            </div>
          );
        },
      },
      {
        accessorKey: "rating",
        header: () => <div className="text-left">Rating</div>,
        cell: ({ row }) => {
          const rating = row.getValue("rating") as number | null;
          return (
            <div className="text-sm">
              {rating ? `${rating}/5` : "N/A"}
            </div>
          );
        },
      },
      {
        accessorKey: "id",
        header: () => <div className="text-left">Actions</div>,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex gap-2">
              <Link
                href={`/paper/${row.getValue("id")}`}
                className="text-blue-500 hover:underline text-sm"
              >
                View
              </Link>
              {status === "ACCEPTED" && (
                <Button
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => handlePublishPaper(row.getValue("id") as string)}
                >
                  <IconCheck className="h-3 w-3 mr-1" />
                  Publish
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: finalPapers,
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
          <p className="text-muted-foreground">Loading papers for final decision...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Final Decision</h1>
        <p className="text-muted-foreground mt-2">
          Accept, reject, update, or publish papers that have completed the review process
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {finalPapers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No papers ready for final decision</h3>
            <p className="text-muted-foreground text-center">
              There are no papers ready for final decision at the moment.
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
              Showing {table.getRowModel().rows.length} of {finalPapers.length} papers
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
    </div>
  );
}