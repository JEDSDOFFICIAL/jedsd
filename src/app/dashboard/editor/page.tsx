"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  UserPlus,
  RefreshCw,
  Edit,
  MessageSquare,
  Mail,
  CheckCircle,
  XCircle,
  Upload,
  MoreHorizontal,
  Users,
  UserCheck,
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
} from "lucide-react";
import toast from "react-hot-toast";
import { ResearchPaper, PaperReview, PaperStatus, User } from "@prisma/client";
import {
  fetchPapers,
  reviewerAllocation,
  reassignReviewer,
  updatePaper,
  acceptPaper,
  rejectPaper,
  publishPaper,
  fetchPaperReviews,
  fetchReviewer,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { IconCheck, IconCloud } from "@tabler/icons-react";
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

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState("all-papers");
  const [allPapers, setAllPapers] = useState<PaperWithRelations[]>([]);
  const [allocatedPapers, setAllocatedPapers] = useState<PaperWithRelations[]>([]);
  const [finalPapers, setFinalPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Table states for All Papers tab
  const [allPapersSorting, setAllPapersSorting] = useState<SortingState>([]);
  const [allPapersColumnFilters, setAllPapersColumnFilters] = useState<ColumnFiltersState>([]);
  const [allPapersGlobalFilter, setAllPapersGlobalFilter] = useState("");

  // Table states for Allocated Papers tab
  const [allocatedPapersSorting, setAllocatedPapersSorting] = useState<SortingState>([]);
  const [allocatedPapersColumnFilters, setAllocatedPapersColumnFilters] = useState<ColumnFiltersState>([]);
  const [allocatedPapersGlobalFilter, setAllocatedPapersGlobalFilter] = useState("");

  // Table states for Final Papers tab
  const [finalPapersSorting, setFinalPapersSorting] = useState<SortingState>([]);
  const [finalPapersColumnFilters, setFinalPapersColumnFilters] = useState<ColumnFiltersState>([]);
  const [finalPapersGlobalFilter, setFinalPapersGlobalFilter] = useState("");

  // Reviewer allocation state
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "ASSIGN_REVIEWER" | "REASSIGN_REVIEWER" | null
  >(null);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [selectedOldReviewer, setSelectedOldReviewer] = useState<string>("");
  const [newReviewer, setNewReviewer] = useState<string>("");
  const [isAllocating, setIsAllocating] = useState(false);

  useEffect(() => {
    fetchAllPapers();
    fetchAllReviewers();
  }, []);

  // Filter papers based on status for different tabs
  useEffect(() => {
    if (allPapers.length > 0) {
      // Allocated papers: papers that have at least one reviewer assigned
      const allocated = allPapers.filter(paper => 
        paper.reviews && paper.reviews.length > 0
      );
      setAllocatedPapers(allocated);

      // Final papers: papers that are ready for final decision (REVIEWED, ACCEPTED, REJECTED, PUBLISHED)
      const finalStatuses = ['REVIEWED', 'ACCEPTED', 'REJECTED', 'PUBLISHED'];
      const final = allPapers.filter(paper => 
        finalStatuses.includes(paper.status)
      );
      setFinalPapers(final);
    }
  }, [allPapers]);
  const fetchAllPapers = async()=>{
    try {
      setLoading(true);
      const response = await fetchPapers();
      const papers = (response?.papers || []).map((paper: any) => ({
        ...paper,
        reviews: paper.reviews ?? [],
      }));
      setAllPapers(papers);
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  }

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
      setLoading(true);
      await reassignReviewer(selectedPaperId, oldReviewerId, newReviewerId);
      toast.success("Reviewer reassigned successfully");
      fetchAllPapers(); // Refresh data
    } catch (error) {
      toast.error("Failed to reassign reviewers");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaper = async (paperId: string) => {
    try {
      // You can implement update functionality with proper form data
      const updateData = {}; // This should come from a modal/form
      await updatePaper(paperId, updateData);
      toast.success("Paper updated successfully");
      fetchAllPapers(); // Refresh data
    } catch (error) {
      toast.error("Failed to update paper");
    }
  };

  const handleAcceptPaper = async (paperId: string) => {
    try {
      await acceptPaper(paperId);
      toast.success("Paper accepted successfully");
      fetchAllPapers(); // Refresh data
    } catch (error) {
      toast.error("Failed to accept paper");
    }
  };

  const handleRejectPaper = async (paperId: string) => {
    try {
      await rejectPaper(paperId);
      toast.success("Paper rejected");
      fetchAllPapers(); // Refresh data
    } catch (error) {
      toast.error("Failed to reject paper");
    }
  };

  const handlePublishPaper = async (paperId: string) => {
    try {
      await publishPaper(paperId);
      toast.success("Paper published successfully");
      fetchAllPapers(); // Refresh data
    } catch (error) {
      toast.error("Failed to publish paper");
    }
  };


  const column_paper_review_table: ColumnDef<PaperWithRelations>[] =
    React.useMemo(
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
          header: () => <div className="text-left">Reviewers</div>,
          cell: ({ row }) => {
            const paper = row.original;
            const reviews = paper.reviews || [];
            
            return (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs justify-center"
                    >
                      {reviews[index] 
                        ? reviews[index].reviewer.name 
                        : `Reviewer ${index + 1}: Not Allocated`
                      }
                    </Badge>
                    {reviews[index] && (
                      <Badge 
                        variant={
                          reviews[index].reviewerStatus === 'ACCEPTED_FOR_PUBLICATION' ? 'default' :
                          reviews[index].reviewerStatus === 'PENDING' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs justify-center"
                      >
                        {reviews[index].reviewerStatus || 'PENDING'}
                      </Badge>
                    )}
                  </div>
                ))}
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

                  <DropdownMenuItem>
                    <Link
                      href={`/paper/${row.original.id}`}
                      className="flex flex-row gap-2 text-sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Paper
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAcceptPaper(paper.id)}
                    className="text-green-600"
                  >
                    <ArrowBigUp className="mr-2 h-4 w-4" />
                    Accept Paper
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRejectPaper(paper.id)}
                    className="text-red-600"
                  >
                    <ArrowBigDown className="mr-2 h-4 w-4" />
                    Reject Paper
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/review/${paper.id}`}
                      className="flex flex-row gap-2 text-sm w-full"
                    >
                      <BookCheck className="mr-2 h-4 w-4" />
                      Read Paper Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleUpdatePaper(paper.id)}
                    className="text-blue-600"
                  >
                    <IconCloud className="mr-2 h-4 w-4" />
                    Update Paper
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ],
      []
    );

  // Column definitions for Tab 1: All Papers
  const reviewer_Allocation_table: ColumnDef<PaperWithRelations>[] = [
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
        <div className="max-w-[200px] truncate">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "author",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-left justify-start font-medium"
          >
            Author
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-2 items-center justify-center">
            <Badge className="bg-green-100/80">{row.original.author?.name}</Badge>
            <Badge className="bg-green-100/80">{row.original.author?.email}</Badge>
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
      cell: ({ row }) => {
        const status = row.getValue("status") as PaperStatus;
        return (
          <Badge variant={status === "UPLOAD" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
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
      cell: ({ row }) => {
        const paper = row.original;
        const canAssignReviewer = (paper: PaperWithRelations) => {
          return (
            paper.status === "UPLOAD" ||
            paper.status === "REVIEWER_ALLOCATION" ||
            (paper.reviews && paper.reviews.length < 3)
          );
        };

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

              <DropdownMenuItem
                onClick={() => window.open(paper.filePath, "_blank")}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Paper
              </DropdownMenuItem>

              {canAssignReviewer(paper) && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setActionType("ASSIGN_REVIEWER");
                  }}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Allocate Reviewer
                </DropdownMenuItem>
              )}

              {paper.reviews && paper.reviews.length > 0 && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setActionType("REASSIGN_REVIEWER");
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reallocate Reviewer
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => handleUpdatePaper(paper.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Update Paper
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];


  const publish_paper_table: ColumnDef<PaperWithRelations>[] = React.useMemo(
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
  
  // TanStack table instances for each tab
  const allPapersTable = useReactTable({
    data: allPapers,
    columns: reviewer_Allocation_table,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setAllPapersSorting,
    onColumnFiltersChange: setAllPapersColumnFilters,
    onGlobalFilterChange: setAllPapersGlobalFilter,
    state: {
      sorting: allPapersSorting,
      columnFilters: allPapersColumnFilters,
      globalFilter: allPapersGlobalFilter,
    },
  });

  const allocatedPapersTable = useReactTable({
    data: allocatedPapers,
    columns: column_paper_review_table,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setAllocatedPapersSorting,
    onColumnFiltersChange: setAllocatedPapersColumnFilters,
    onGlobalFilterChange: setAllocatedPapersGlobalFilter,
    state: {
      sorting: allocatedPapersSorting,
      columnFilters: allocatedPapersColumnFilters,
      globalFilter: allocatedPapersGlobalFilter,
    },
  });

  const finalPapersTable = useReactTable({
    data: finalPapers,
    columns: publish_paper_table,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setFinalPapersSorting,
    onColumnFiltersChange: setFinalPapersColumnFilters,
    onGlobalFilterChange: setFinalPapersGlobalFilter,
    state: {
      sorting: finalPapersSorting,
      columnFilters: finalPapersColumnFilters,
      globalFilter: finalPapersGlobalFilter,
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage papers, reviews, and publications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-papers">All Papers</TabsTrigger>
          <TabsTrigger value="allocated-papers">Allocated Papers</TabsTrigger>
          <TabsTrigger value="final-papers">Final Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="all-papers" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">All Papers</h2>
            <p className="text-gray-600 dark:text-gray-400">
              View, allocate reviewers, reallocate reviewers, and update papers
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={allPapersGlobalFilter ?? ""}
                onChange={(event) => setAllPapersGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {allPapersTable.getHeaderGroups().map((headerGroup) => (
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={reviewer_Allocation_table.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : allPapersTable.getRowModel().rows?.length ? (
                  allPapersTable.getRowModel().rows.map((row) => (
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
                      colSpan={reviewer_Allocation_table.length}
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
              Showing {allPapersTable.getRowModel().rows.length} of {allPapers.length} papers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => allPapersTable.setPageIndex(0)}
                disabled={!allPapersTable.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allPapersTable.previousPage()}
                disabled={!allPapersTable.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Page</span>
                <span className="text-sm font-medium">
                  {allPapersTable.getState().pagination.pageIndex + 1} of{" "}
                  {allPapersTable.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allPapersTable.nextPage()}
                disabled={!allPapersTable.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allPapersTable.setPageIndex(allPapersTable.getPageCount() - 1)}
                disabled={!allPapersTable.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="allocated-papers" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Papers with Allocated Reviewers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View reviews, update papers, and contact authors
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={allocatedPapersGlobalFilter ?? ""}
                onChange={(event) => setAllocatedPapersGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {allocatedPapersTable.getHeaderGroups().map((headerGroup) => (
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={column_paper_review_table.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : allocatedPapersTable.getRowModel().rows?.length ? (
                  allocatedPapersTable.getRowModel().rows.map((row) => (
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
                      colSpan={column_paper_review_table.length}
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
              Showing {allocatedPapersTable.getRowModel().rows.length} of {allocatedPapers.length} papers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => allocatedPapersTable.setPageIndex(0)}
                disabled={!allocatedPapersTable.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allocatedPapersTable.previousPage()}
                disabled={!allocatedPapersTable.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Page</span>
                <span className="text-sm font-medium">
                  {allocatedPapersTable.getState().pagination.pageIndex + 1} of{" "}
                  {allocatedPapersTable.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allocatedPapersTable.nextPage()}
                disabled={!allocatedPapersTable.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allocatedPapersTable.setPageIndex(allocatedPapersTable.getPageCount() - 1)}
                disabled={!allocatedPapersTable.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="final-papers" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Final Decision</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Accept, reject, update, or publish papers
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={finalPapersGlobalFilter ?? ""}
                onChange={(event) => setFinalPapersGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {finalPapersTable.getHeaderGroups().map((headerGroup) => (
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={publish_paper_table.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : finalPapersTable.getRowModel().rows?.length ? (
                  finalPapersTable.getRowModel().rows.map((row) => (
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
                      colSpan={publish_paper_table.length}
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
              Showing {finalPapersTable.getRowModel().rows.length} of {finalPapers.length} papers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => finalPapersTable.setPageIndex(0)}
                disabled={!finalPapersTable.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => finalPapersTable.previousPage()}
                disabled={!finalPapersTable.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Page</span>
                <span className="text-sm font-medium">
                  {finalPapersTable.getState().pagination.pageIndex + 1} of{" "}
                  {finalPapersTable.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => finalPapersTable.nextPage()}
                disabled={!finalPapersTable.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => finalPapersTable.setPageIndex(finalPapersTable.getPageCount() - 1)}
                disabled={!finalPapersTable.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reviewer Allocation Modal */}
      {selectedPaper && actionType && (
        <AlertDialog
          open={!!selectedPaper}
          onOpenChange={() => setSelectedPaper(null)}
        >
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "ASSIGN_REVIEWER"
                  ? "Assign Reviewers"
                  : "Reassign Reviewers"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Paper: {selectedPaper.title}
                <br />
                Select reviewers for this paper (maximum 3 reviewers)
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <h4 className="font-medium">Available Reviewers</h4>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {reviewers.map((reviewer) => {
                    const isSelected = selectedReviewers.includes(reviewer.id);
                    const isAlreadyAssigned = selectedPaper.reviews?.some(
                      (review) => review.reviewerId === reviewer.id
                    );
                    const isDisabled =
                      !isSelected && selectedReviewers.length >= 3;

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
                            setSelectedReviewers((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== reviewer.id)
                                : [...prev, reviewer.id]
                            );
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

              {selectedReviewers.length > 0 && (
                <div className="grid gap-2">
                  <h4 className="font-medium">
                    Selected Reviewers ({selectedReviewers.length}/3)
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
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedPaper(null)}>
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
                disabled={selectedReviewers.length === 0 || isAllocating}
              >
                {isAllocating
                  ? "Processing..."
                  : actionType === "ASSIGN_REVIEWER"
                    ? "Assign Reviewers"
                    : "Reassign Reviewers"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
