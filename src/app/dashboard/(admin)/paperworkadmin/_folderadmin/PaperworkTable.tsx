"use client"

import * as React from "react"
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
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table"

import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconLoader,
  IconLayoutColumns,
} from "@tabler/icons-react"
import { ResearchPaper } from "@prisma/client"
import { fetchPapers } from "@/lib/paperActions"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { assignReviewer, fetchReviewers, Reviewer } from "@/lib/AssignReviewer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowUpDown, Check, MoreHorizontal } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"


export function DataTableAdmin() {
   
     
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
const [totalPages, setTotalPages] = React.useState(0)

  const { data: session } = useSession()
  const [data, setData] = React.useState<ResearchPaper[]>([])
  const [loading, setLoading] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    const papers = await fetchPapers({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize, // ✅ Important Fix
    })
    if (papers) {
        setData(papers.papers)
        setTotalPages(papers.totalPages)
    }
    setLoading(false)
  }, [pagination.pageIndex, pagination.pageSize])

  React.useEffect(() => {
    fetchData()
    fetchReviewersData();
  }, [fetchData])
 const [reviewers, setReviewers] = React.useState<Reviewer[]>([]); // State to store fetched reviewers
    
      // --- Fetching Papers --
      // --- Fetching Reviewers ---
      const fetchReviewersData = React.useCallback(async () => {
        const fetchedReviewers = await fetchReviewers();
        if (fetchedReviewers) {
          setReviewers(fetchedReviewers);
        }
      }, []);
    
    
    
      const handleAssignReviewer = React.useCallback(
        async (paperId: string, reviewerId: string) => {
          setLoading(true);
          await assignReviewer(
            paperId,
            reviewerId,
            "REVIEWER_ALLOCATION",
            () => {
              fetchData(); // Refetch papers to update the table with the new reviewer assignment
            }
          );
          setLoading(false);
        },
        [fetchData]
      );
      
const columns: ColumnDef<ResearchPaper>[] = [
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
    enableHiding: false,
    cell: ({ row }) => (
      <Link
        href={`/paper/${row.original.id}`}
        className="hover:text-blue-500 hover:underline"
      >
        {row.original.title.length > 30
          ? row.original.title.slice(0, 30) + "..."
          : row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <IconChevronDown
          className={`ml-2 transition-transform ${
            column.getIsSorted() === "desc" ? "rotate-180" : ""
          }`}
        />
      </Button>
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="text-muted-foreground px-1.5 flex items-center gap-1"
      >
        {row.original.status === "PUBLISH" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 w-4 h-4" />
        ) : (
          <IconLoader className="w-4 h-4 animate-spin" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "reviewerStatus",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Reviewer Status
        <IconChevronDown
          className={`ml-2 transition-transform ${
            column.getIsSorted() === "desc" ? "rotate-180" : ""
          }`}
        />
      </Button>
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="text-muted-foreground px-1.5 flex items-center gap-1"
      >
        {row.original.reviewerStatus === "ACCEPTED" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 w-4 h-4" />
        ) : (
          <IconLoader className="w-4 h-4 animate-spin" />
        )}
        {row.original.reviewerStatus}
      </Badge>
    ),
  },
  {
        accessorKey: "reviewer",
        header: () => <div className="text-left"> Reviewer</div>,
        cell: ({ row }) => {
          const reviewer = row.getValue("reviewer") as { email?: string };
          console.log("Reviewer data:", reviewer);
          return <div className="lowercase">{reviewer?.email || "++"}</div>;
        },
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
              View Paper
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
              View Cover Letter
            </a>
          </div>
        ),
      },
      {
        accessorKey: "submissionDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="text-left "
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Submission Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="lowercase">
            {(() => {
              const value = row.getValue("submissionDate");
              const date = value ? new Date(value as string) : null;
              return date ? date.toLocaleString() : "";
            })()}
          </div>
        ),
      },
    

  {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <ActionsCell
              paper={row.original}
              reviewers={reviewers}
              onAssign={handleAssignReviewer}
            />
          );
        }
      },
]
  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
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
  })

  if (!session) return <div>Please log in to view this page.</div>

  return (
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
            {table.getAllColumns()
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
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  {[5,10, 20, 30, 40, 50].map((size) => (
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
  )
}


function ActionsCell({
  paper,
  reviewers,
  onAssign,
}: {
  paper: ResearchPaper;
  reviewers: Reviewer[];
  onAssign: (paperId: string, reviewerId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedReviewer, setSelectedReviewer] = React.useState<Reviewer | null>(
    reviewers.find((r) => r.id === paper.reviewerId) || null
  );

  React.useEffect(() => {
    setSelectedReviewer(
      reviewers.find((r) => r.id === paper.reviewerId) || null
    );
  }, [paper.reviewerId, reviewers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search reviewer..." />
          <CommandEmpty>No reviewer found.</CommandEmpty>
          <CommandGroup>
            {reviewers.length > 0 ? (
              reviewers.map((reviewer) => (
                <CommandItem
                  key={reviewer.id}
                  value={reviewer.name}
                  onSelect={() => {
                    onAssign(paper.id, reviewer.id);
                    setSelectedReviewer(reviewer);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedReviewer?.id === reviewer.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {reviewer.name}
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No reviewers available</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
