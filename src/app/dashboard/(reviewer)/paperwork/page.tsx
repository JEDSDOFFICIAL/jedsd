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
import {
  AccessibilityIcon,
  ActivityIcon,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ResearchPaper } from "@prisma/client";
import Link from "next/link";
import { fetchPapers } from "@/lib/paperActions";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { reviewerAcceptence } from "@/lib/AssignReviewer";

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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  IconChevronDown,
  IconLayoutColumns,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

export default function ReviewerReqList() {
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
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    const papers = await fetchPapers({
      reviewerId: session.user.id as string,
    });
    if (papers) {
      setData(papers.papers);
    }
    setLoading(false);
  }, [session?.user?.id]);

  const updateData = React.useCallback(
    async (paperId: string, type: string) => {
      if (type !== "ACCEPTED" && type !== "REJECTED") {
        toast.error("Invalid action type");
        return;
      } else if (type === "ACCEPTED") {
        setLoading(true);
        await reviewerAcceptence(paperId, "ACCEPT", fetchData);
        setLoading(false);
      } else {
        setLoading(true);
        await reviewerAcceptence(paperId, "REJECT", fetchData);
        setLoading(false);
      }
    },
    [fetchData]
  );

  const columns: ColumnDef<ResearchPaper>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: () => <div className="text-left">Title</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {(row.getValue("title") as string).length > 30
              ? (row.getValue("title") as string).slice(0, 30) + "..."
              : (row.getValue("title") as string)}
          </div>
        ),
      },
      {
        accessorKey: "keywords",
        header: () => <div className="text-left">Keywords</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {Array.isArray(row.getValue("keywords"))
              ? (row.getValue("keywords") as string[]).join(", ")
              : typeof row.getValue("keywords") === "string"
              ? (row.getValue("keywords") as string)
              : ""}
          </div>
        ),
      },
      {
        accessorKey: "filePath",
        header: () => <div className="text-left">Paper Link</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            <a
              href={row.getValue("filePath")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Paper{" "}
            </a>
          </div>
        ),
      },
      {
        accessorKey: "coverLetterPath",
        header: () => <div className="text-left">Cover Letter</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            <a
              href={row.getValue("coverLetterPath")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Cover Letter{" "}
            </a>
          </div>
        ),
      },
      {
        accessorKey: "reviewerStatus",
        header: () => <div className="text-left">Reviewer Status</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {row.getValue("reviewerStatus") ? (
              row.getValue("reviewerStatus")
            ) : (
              <span className="text-gray-500">No Status</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: () => <div className="text-left">Read Full Paper</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {row.getValue("id") ? (
              <Link
                href={`/paper/${row.getValue("id")}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            ) : (
              <span className="text-gray-500">No Paper ID</span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const paperId = row.getValue("id") as string;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions on Row</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {row.original.reviewerStatus !== "ACCEPTED" && row.original.reviewerStatus !== "REJECTED" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => updateData(paperId, "ACCEPTED")}
                    >
                      <AccessibilityIcon className="h-4 w-4 mr-2" />
                      Accept Paper
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => updateData(paperId, "REJECTED")}
                    >
                      <AccessibilityIcon className="h-4 w-4 mr-2" />
                      Reject Paper
                    </DropdownMenuItem>
                  </>
                )}
                 {row.original.reviewerStatus === "ACCEPTED" && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      toast("Navigate to review page for " + paperId);
                    }}
                  >
                    <ActivityIcon className="h-4 w-4 mr-2" />
                    Provide Review
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [updateData]
  );

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [fetchData, session?.user?.id]);

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
    <div className="max-w-full h-fit flex flex-col justify-between items-center px-2 ">
      <p className="dark:text-white text-black text-xl font-bold text-center w-full sm:text-3xl my-4">
        List of Papers Assigned for Review
      </p>
      <Tabs defaultValue="outline" className="w-full flex-col gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
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

        <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
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
                        No results.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}