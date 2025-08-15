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
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import Link from "next/link";
import { fetchPapers } from "@/lib/Frontend-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

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
import {
  IconChevronDown,
  IconLayoutColumns,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface ResearchPaper {
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
  author?: {
    name: string;
    email: string;
  };
  contributors: any;
  pointOfContact: any;
}

export default function PublicationsPage() {
  const { data: session } = useSession();
  const [data, setData] = React.useState<ResearchPaper[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    
    // Fetch papers that are ready for publication or already published
    const papers = await fetchPapers({
      status: "ACCEPTED,PUBLISH",
    });
    
    if (papers) {
      setData(papers.papers as ResearchPaper[]);
      setTotalPages(papers.totalPages);
    }
    setLoading(false);
  }, []);

  const handlePublish = async (paperId: string) => {
    try {
      const response = await fetch(`/api/paper/${paperId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refresh data after successful publication
        fetchData();
      } else {
        console.error("Failed to publish paper");
      }
    } catch (error) {
      console.error("Error publishing paper:", error);
    }
  };

  const columns: ColumnDef<ResearchPaper>[] = React.useMemo(
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
                  onClick={() => handlePublish(row.getValue("id"))}
                  className="text-xs h-6"
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

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-full h-fit flex flex-col justify-between items-center px-2">
      <p className="dark:text-white text-black text-xl font-bold text-center w-full sm:text-3xl my-4">
        Publication Management
      </p>
      
      <div className="w-full flex-col gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6 mb-4">
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
                .filter((col) => col.getCanHide() && typeof col.accessorFn !== "undefined")
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    className="capitalize"
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No papers ready for publication found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30, 40, 50].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
