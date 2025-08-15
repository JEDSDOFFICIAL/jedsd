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
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserPlus,
  Send,
  Settings,
  Filter,
  RefreshCw,
  Expand,
  Upload,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ResearchPaper, User } from "@prisma/client";
import { fetchPapers, publishPaper } from "@/lib/Frontend-actions";
import { fetchReviewer,reviewerAllocation } from "@/lib/Frontend-actions";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import axios from "axios";
import { AuthorOrContact } from "@/types/dataTypes";


interface Reviewer {
  name: string;
  email: string;
}

interface reviews {
  id: string;
  reviewerId: string;
  reviewerStatus: string; // This matches the API response field name
  reviewer: Reviewer;
  reviewText?: string;
  rating?: number;
}

interface PaperWithReviewer extends ResearchPaper {
  author: { name: string, email: string },
  reviews?: reviews[]
}


export default function ReviewerAllocationManagement() {
  const { data: session } = useSession();
  
  // State for both tables
  const [uploadedPapers, setUploadedPapers] = React.useState<PaperWithReviewer[]>([]);
  const [assignedPapers, setAssignedPapers] = React.useState<PaperWithReviewer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [assignLoading, setAssignLoading] = React.useState(false);
  
  // Table states for uploaded papers
  const [uploadedSorting, setUploadedSorting] = React.useState<SortingState>([]);
  const [uploadedColumnFilters, setUploadedColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [uploadedColumnVisibility, setUploadedColumnVisibility] = React.useState<VisibilityState>({});
  const [uploadedRowSelection, setUploadedRowSelection] = React.useState({});
  
  // Table states for assigned papers
  const [assignedSorting, setAssignedSorting] = React.useState<SortingState>([]);
  const [assignedColumnFilters, setAssignedColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [assignedColumnVisibility, setAssignedColumnVisibility] = React.useState<VisibilityState>({});
  const [assignedRowSelection, setAssignedRowSelection] = React.useState({});
  
  // Reviewer allocation states
  const [selectedPaper, setSelectedPaper] = React.useState<PaperWithReviewer | null>(null);
  const [reviewers, setReviewers] = React.useState<User[]>([]);
  const [selectedReviewers, setSelectedReviewers] = React.useState<string[]>([]);
  const [selectedReviewersToRemove, setSelectedReviewersToRemove] = React.useState<string[]>([]);
  const [actionType, setActionType] = React.useState<"ASSIGN_REVIEWER" | "REASSIGN_REVIEWER" | "PUBLISH" | null>(null);
  const [currentTab, setCurrentTab] = React.useState("uploaded");

  React.useEffect(() => {
    fetchAllPapers();
    loadReviewers();
  }, []);

  const fetchAllPapers = async () => {
    try {
      setLoading(true);
      const response = await fetchPapers({});
      if (response) {
        const allPapers = (response.papers || []).map((paper: any) => ({
          ...paper,
          author: paper.author || { name: "Unknown", email: "" },
          reviewers: paper.reviewers || [],
          paperReviews: paper.reviews || [] // Map 'reviews' from API to 'paperReviews' for consistency
        }));
        
        // Separate papers into uploaded (no reviewers) and assigned (has reviewers)
        // Check paperReviews (mapped from API 'reviews') to determine assignment status
        const uploaded = allPapers.filter((paper: PaperWithReviewer) => 
          !paper.reviews || paper.reviews.length === 0
        );
        const assigned = allPapers.filter((paper: PaperWithReviewer) => 
          paper.reviews && paper.reviews.length > 0
        );
        
        setUploadedPapers(uploaded);
        setAssignedPapers(assigned);
        console.log("Uploaded papers:", uploaded.length, "Assigned papers:", assigned.length);
        console.log("Sample uploaded paper:", uploaded[0]?.title, "reviews:", uploaded[0]?.paperReviews?.length);
        console.log("Sample assigned paper:", assigned[0]?.title, "reviews:", assigned[0]?.paperReviews?.length);
      } else {
        setUploadedPapers([]);
        setAssignedPapers([]);
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  };

  const loadReviewers = async () => {
    try {
      const reviewerData = await fetchReviewer();
      if (reviewerData) {
        setReviewers(reviewerData);
      }
      console.log("fetched reviewer data is ", reviewerData);
    } catch (error) {
      console.error("Error fetching reviewers:", error);
    }
  };


  const handleAssignReviewer = async () => {
    if (!selectedPaper || selectedReviewers.length === 0) {
      toast.error("Please select at least one reviewer");
      return;
    }

    if (selectedReviewers.length > 3) {
      toast.error("Maximum 3 reviewers can be assigned to a paper");
      return;
    }

    setLoading(true);
    try {
      await reviewerAllocation(selectedPaper.id, selectedReviewers, () => {
        toast.success(`${selectedReviewers.length} reviewer(s) assigned successfully`);
        setSelectedPaper(null);
        setSelectedReviewers([]);
        setSelectedReviewersToRemove([]);
        setActionType(null);
        // Refresh both tables
        fetchAllPapers();
      });
    } catch (error) {
      console.error("Error assigning reviewers:", error);
      toast.error("Failed to assign reviewers");
    } finally {
      setLoading(false);
    }
  };

  const handleReassignReviewer = async () => {
    if (!selectedPaper) {
      toast.error("No paper selected");
      return;
    }

    // Check if we have changes to make
    if (selectedReviewersToRemove.length === 0 && selectedReviewers.length === 0) {
      toast.error("Please select reviewers to remove or add");
      return;
    }

    // Validate total reviewer count after changes
    const currentReviewers = selectedPaper.reviews?.length || 0;
    const finalCount = currentReviewers - selectedReviewersToRemove.length + selectedReviewers.length;
    
    if (finalCount > 3) {
      toast.error("Total reviewers cannot exceed 3");
      return;
    }

    if (finalCount === 0) {
      toast.error("At least one reviewer must remain assigned");
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use the same API endpoint and let the backend handle the logic
      // You might want to create a specific reassignment endpoint
      if (selectedReviewers.length > 0) {
        await reviewerAllocation(selectedPaper.id, selectedReviewers, () => {
          toast.success(`Reviewers reassigned successfully`);
          setSelectedPaper(null);
          setSelectedReviewers([]);
          setSelectedReviewersToRemove([]);
          setActionType(null);
          fetchAllPapers();
        });
      } else {
        // Handle removal only case - you might need a separate API endpoint for this
        toast.error("Removal-only functionality needs backend implementation");
      }
    } catch (error) {
      console.error("Error reassigning reviewers:", error);
      toast.error("Failed to reassign reviewers");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerId)) {
        // Remove reviewer
        return prev.filter(id => id !== reviewerId);
      } else {
        // Add reviewer if under limit
        if (prev.length >= 3) {
          toast.error("Maximum 3 reviewers can be assigned to a paper");
          return prev;
        }
        return [...prev, reviewerId];
      }
    });
  };

  const handleSelectAllReviewers = () => {
    // Filter out reviewers that are already assigned to this paper
    const availableReviewerIds = reviewers
      .filter(reviewer => {
        const isAlreadyAssigned = selectedPaper?.reviews?.some((review: reviews) => review.reviewerId === reviewer.id);
        return !isAlreadyAssigned;
      })
      .map(reviewer => reviewer.id);
    
    // If all available reviewers are selected, deselect all. Otherwise, select all available.
    const allAvailableSelected = availableReviewerIds.every(id => selectedReviewers.includes(id));
    setSelectedReviewers(allAvailableSelected ? [] : availableReviewerIds);
  };

  const handleReviewerRemovalToggle = (reviewerId: string) => {
    setSelectedReviewersToRemove(prev => 
      prev.includes(reviewerId) 
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const handleSelectAllAssignedReviewers = () => {
    const assignedReviewerIds = selectedPaper?.reviews?.map(review => review.reviewerId) || [];
    const allAssignedSelected = assignedReviewerIds.every(id => selectedReviewersToRemove.includes(id));
    setSelectedReviewersToRemove(allAssignedSelected ? [] : assignedReviewerIds);
  };

  const handlePublishPaper = async () => {
    if (!selectedPaper) return;

    await publishPaper(selectedPaper.id, () => {
      toast.success("Paper published successfully");
      setSelectedPaper(null);
      setActionType(null);
      fetchAllPapers();
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      // Paper statuses
      case "UPLOAD": return "secondary";
      case "REVIEWER_ALLOCATION": return "outline";
      case "ON_REVIEW": return "default";
      case "ON_EDIT": return "default";
      case "PUBLISH": return "destructive";
      case "ACCEPTED": return "destructive";
      case "REJECTED": return "destructive";
      
      // Reviewer statuses
      case "PENDING": return "outline";
      case "ACCEPTED_FOR_REVIEW": return "default";
      case "REJECTED_FOR_REVIEW": return "destructive";
      case "ACCEPTED_FOR_PUBLICATION": return "destructive";
      case "REJECTED_FOR_PUBLICATION": return "destructive";
      
      default: return "secondary";
    }
  };

  const canAssignReviewer = (paper: PaperWithReviewer) => {
    return paper.status === "UPLOAD" || paper.status === "REVIEWER_ALLOCATION";
  };

  const columns: ColumnDef<PaperWithReviewer>[] = [
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
        <div className="max-w-[250px] truncate font-medium">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.author?.name || "Unknown"}
        </div>
      ),
    },
    {
      accessorKey: "POC Email",
      header: "POC Email",
      cell: ({ row }) => {
        const pointOfContact = row.original.pointOfContact as AuthorOrContact;
        return (
          <div className="text-sm">
            {pointOfContact?.email || "No email"}
          </div>
        );
      },
    },
    {
      accessorKey: "POC Contact",
      header: "POC Contact",
      cell: ({ row }) => {
        const pointOfContact = row.original.pointOfContact as AuthorOrContact;
        return (
          <div className="text-sm">
            {pointOfContact?.contactNumber || "No contact"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
   
    {
      accessorKey: "submissionDate",
      header: "Submitted",
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
              
              <DropdownMenuItem onClick={() => window.open(paper.filePath, "_blank")}>
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
                  Assign Reviewer
                </DropdownMenuItem>
              )}
        
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Column definitions for assigned papers table
  const assignedPapersColumns: ColumnDef<PaperWithReviewer>[] = [
    {
      accessorKey: "paper name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Paper Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate font-medium">
          {row.original.title}
        </div>
      ),
    },
    {
      id: "reviewer1",
      header: "Reviewer 1",
      cell: ({ row }) => {
        const reviews = row.original.reviews || [];
        console.log("Reviewer 1 reviews:", reviews);
        const reviewer1 = reviews[0];
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {reviewer1?.reviewer.email || "-"}
            </div> 
            {reviewer1 && (
              <Badge variant={getStatusBadgeVariant(reviewer1.reviewerStatus)} className="text-xs">
                {reviewer1.reviewerStatus.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "reviewer2",
      header: "Reviewer 2",
      cell: ({ row }) => {
        const reviews = row.original.reviews || [];
        const reviewer2 = reviews[1];
        return (
          <div className="space-y-1">
             <div className="text-sm font-medium">
              {reviewer2?.reviewer?.email || "-"}
            </div> 
            {reviewer2 && (
              <Badge variant={getStatusBadgeVariant(reviewer2.reviewerStatus)} className="text-xs">
                {reviewer2.reviewerStatus.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "reviewer3",
      header: "Reviewer 3",
      cell: ({ row }) => {
        const reviews = row.original.reviews || [];
        const reviewer3 = reviews[2];
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {reviewer3?.reviewer?.email || "-"}
            </div>
            {reviewer3 && (
              <Badge variant={getStatusBadgeVariant(reviewer3.reviewerStatus)} className="text-xs">
                {reviewer3.reviewerStatus.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Paper Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.replace(/_/g, " ")}
          </Badge>
        );
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
                <span className="sr-only">Open menu</span>
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

              {(paper.reviews && paper.reviews.length < 3) && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setActionType("ASSIGN_REVIEWER");
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add More Reviewers
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(paper);
                  setActionType("REASSIGN_REVIEWER");
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Reassign Reviewers
              </DropdownMenuItem>
        
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Uploaded papers table (no reviewers assigned)
  const uploadedTable = useReactTable({
    data: uploadedPapers,
    columns,
    onSortingChange: setUploadedSorting,
    onColumnFiltersChange: setUploadedColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setUploadedColumnVisibility,
    onRowSelectionChange: setUploadedRowSelection,
    state: {
      sorting: uploadedSorting,
      columnFilters: uploadedColumnFilters,
      columnVisibility: uploadedColumnVisibility,
      rowSelection: uploadedRowSelection,
    },
  });

  // Assigned papers table (has reviewers assigned)
  const assignedTable = useReactTable({
    data: assignedPapers,
    columns: assignedPapersColumns,
    onSortingChange: setAssignedSorting,
    onColumnFiltersChange: setAssignedColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setAssignedColumnVisibility,
    onRowSelectionChange: setAssignedRowSelection,
    state: {
      sorting: assignedSorting,
      columnFilters: assignedColumnFilters,
      columnVisibility: assignedColumnVisibility,
      rowSelection: assignedRowSelection,
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading papers for reviewer assignment...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">
            Manage paper assignments, review process, and publication workflow
          </p>
        </div>
        <Button onClick={fetchAllPapers} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadedPapers.length + assignedPapers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...uploadedPapers, ...assignedPapers].filter(p => p.status === "ON_REVIEW").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Being Edited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...uploadedPapers, ...assignedPapers].filter(p => p.status === "ON_EDIT").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...uploadedPapers, ...assignedPapers].filter(p => p.status === "PUBLISH").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Papers Workflow Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs for different paper states */}
          <Tabs defaultValue="uploaded" className="space-y-4">
            <TabsList>
              <TabsTrigger value="uploaded" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Uploaded Papers ({uploadedPapers.length})
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assigned Papers ({assignedPapers.length})
              </TabsTrigger>
            </TabsList>

            {/* Uploaded Papers Tab */}
            <TabsContent value="uploaded" className="space-y-4">
              {/* Filters for uploaded papers */}
              <div className="flex items-center gap-4 py-4">
                <Input
                  placeholder="Search papers..."
                  value={(uploadedTable.getColumn("title")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    uploadedTable.getColumn("title")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>

              {/* Uploaded Papers Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {uploadedTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {uploadedTable.getRowModel().rows?.length ? (
                      uploadedTable.getRowModel().rows.map((row) => (
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
                          No uploaded papers waiting for reviewer assignment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for uploaded papers */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${uploadedTable.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      uploadedTable.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={uploadedTable.getState().pagination.pageSize} />
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
                
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {uploadedTable.getState().pagination.pageIndex + 1} of{" "}
                    {uploadedTable.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => uploadedTable.setPageIndex(0)}
                      disabled={!uploadedTable.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      {"<<"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => uploadedTable.previousPage()}
                      disabled={!uploadedTable.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      {"<"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => uploadedTable.nextPage()}
                      disabled={!uploadedTable.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      {">"}
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => uploadedTable.setPageIndex(uploadedTable.getPageCount() - 1)}
                      disabled={!uploadedTable.getCanNextPage()}
                    >
                      <span className="sr-only">Go to last page</span>
                      {">>"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Assigned Papers Tab */}
            <TabsContent value="assigned" className="space-y-4">
              {/* Filters for assigned papers */}
              <div className="flex items-center gap-4 py-4">
                <Input
                  placeholder="Search papers..."
                  value={(assignedTable.getColumn("paper name")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    assignedTable.getColumn("paper name")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>

              {/* Assigned Papers Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {assignedTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {assignedTable.getRowModel().rows?.length ? (
                      assignedTable.getRowModel().rows.map((row) => (
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
                          colSpan={assignedPapersColumns.length}
                          className="h-24 text-center"
                        >
                          No papers with assigned reviewers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for assigned papers */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${assignedTable.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      assignedTable.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={assignedTable.getState().pagination.pageSize} />
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
                
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {assignedTable.getState().pagination.pageIndex + 1} of{" "}
                    {assignedTable.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => assignedTable.setPageIndex(0)}
                      disabled={!assignedTable.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      {"<<"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => assignedTable.previousPage()}
                      disabled={!assignedTable.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      {"<"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => assignedTable.nextPage()}
                      disabled={!assignedTable.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      {">"}
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => assignedTable.setPageIndex(assignedTable.getPageCount() - 1)}
                      disabled={!assignedTable.getCanNextPage()}
                    >
                      <span className="sr-only">Go to last page</span>
                      {">>"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Alert Dialog */}
      <AlertDialog 
        open={!!actionType} 
        onOpenChange={() => {
          setActionType(null);
          setSelectedPaper(null);
          setSelectedReviewers([]);
          setSelectedReviewersToRemove([]);
        }}
      >
        <AlertDialogContent className="max-w-screen w-7xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
              {actionType === "ASSIGN_REVIEWER" && "Assign Reviewers"}
              {actionType === "REASSIGN_REVIEWER" && "Reassign Reviewers"}
              {actionType === "PUBLISH" && "Publish Paper"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              {actionType === "ASSIGN_REVIEWER" && "Select one or more reviewers to assign to this research paper"}
              {actionType === "REASSIGN_REVIEWER" && "Modify reviewer assignments for this paper (existing reviewers are disabled)"}
              {actionType === "PUBLISH" && "Confirm publishing this paper to make it publicly available"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedPaper && (
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin px-1">
              <div className="space-y-6">
                {/* Paper Information Card */}
                <Card className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 border-blue-200/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Paper Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-center">
                      <h3 className="font-semibold text-gray-900 leading-relaxed text-lg">
                        {selectedPaper.title}
                      </h3>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                        <span>by {selectedPaper.author?.name || "Unknown Author"}</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedPaper.status.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {actionType === "ASSIGN_REVIEWER" && (
                  <Card className="bg-white/70 backdrop-blur-sm border-gray-200/60">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                          Available Reviewers
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllReviewers}
                          className="bg-white/90 hover:bg-white border-gray-300"
                        >
                          {(() => {
                            const availableReviewers = reviewers.filter(reviewer => {
                              const isAlreadyAssigned = selectedPaper?.reviews?.some((review: reviews) => review.reviewerId === reviewer.id);
                              return !isAlreadyAssigned;
                            });
                            const allAvailableSelected = availableReviewers.every(reviewer => selectedReviewers.includes(reviewer.id));
                            return allAvailableSelected && availableReviewers.length > 0 ? "Deselect All" : "Select All Available";
                          })()}
                        </Button>
                      </div>
                      {selectedReviewers.length > 0 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50/90 px-4 py-3 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <strong>{selectedReviewers.length}</strong> reviewer{selectedReviewers.length !== 1 ? 's' : ''} selected
                        </div>
                      )}
                      {selectedPaper?.reviews && selectedPaper.reviews.length > 0 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50/90 px-4 py-3 rounded-lg">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <strong>{selectedPaper.reviews.length}</strong> reviewer{selectedPaper.reviews.length !== 1 ? 's' : ''} already assigned (disabled)
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="h-fit space-y-3 pr-2">
                        {reviewers.map((reviewer, index) => {
                          // Check if this reviewer is already assigned to the paper
                          const isExistingReviewer = selectedPaper?.reviews?.some((review: reviews) => review.reviewerId === reviewer.id);
                          const isDisabled = isExistingReviewer;
                          
                          return (
                            <div key={reviewer.id}>
                              <div 
                                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                  isDisabled 
                                    ? 'border-gray-300 bg-gray-100/90 opacity-60 cursor-not-allowed'
                                    : `cursor-pointer hover:shadow-lg transform hover:scale-[1.02] ${
                                        selectedReviewers.includes(reviewer.id)
                                          ? 'border-blue-400 bg-blue-50/90 shadow-md ring-2 ring-blue-200/50'
                                          : 'border-gray-200 bg-white/90 hover:border-gray-300 hover:bg-gray-50/90'
                                      }`
                                }`}
                                onClick={() => !isDisabled && handleReviewerToggle(reviewer.id)}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    {selectedReviewers.includes(reviewer.id) && !isDisabled && (
                                      <div className="absolute -inset-1 bg-blue-200/60 rounded-full animate-ping"></div>
                                    )}
                                  </div>
                                  
                                  <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
                                    <AvatarImage 
                                      src={reviewer.profileImage || `https://ui-avatars.com/api/?name=${reviewer.name}&background=random`}
                                      alt={reviewer.name || "Reviewer Avatar"}
                                    />
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 truncate text-lg">
                                      {reviewer.name || 'Unknown Reviewer'}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                      {reviewer.email || 'No email provided'}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        Reviewer
                                      </Badge>
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                      <span className="text-xs text-gray-400">
                                        {isExistingReviewer ? "Already Assigned" : "Available"}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                    isDisabled
                                      ? 'bg-gray-400'
                                      : selectedReviewers.includes(reviewer.id) 
                                        ? 'bg-blue-500 shadow-lg ring-2 ring-blue-200' 
                                        : 'bg-gray-300 group-hover:bg-gray-400'
                                  }`}></div>
                                </div>
                              </div>
                              
                              {index < reviewers.length - 1 && (
                                <Separator className="my-3 bg-gray-200/60" />
                              )}
                            </div>
                          );
                        })}
                        
                        {reviewers.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No reviewers available</p>
                            <p className="text-sm">Please add reviewers to the system first</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {actionType === "REASSIGN_REVIEWER" && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column: Currently Assigned Reviewers */}
                    <Card className="bg-red-50/70 backdrop-blur-sm border-red-200/60">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-red-600" />
                            Currently Assigned
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAllAssignedReviewers}
                            className="bg-white/90 hover:bg-white border-red-300"
                          >
                            {(() => {
                              const assignedReviewerIds = selectedPaper?.reviews?.map(review => review.reviewerId) || [];
                              const allAssignedSelected = assignedReviewerIds.every(id => selectedReviewersToRemove.includes(id));
                              return allAssignedSelected && assignedReviewerIds.length > 0 ? "Deselect All" : "Select All to Remove";
                            })()}
                          </Button>
                        </div>
                        {selectedReviewersToRemove.length > 0 && (
                          <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50/90 px-4 py-3 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <strong>{selectedReviewersToRemove.length}</strong> reviewer{selectedReviewersToRemove.length !== 1 ? 's' : ''} to remove
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="h-fit space-y-3 pr-2">
                          {selectedPaper?.reviews?.map((review, index) => {
                            const reviewer = reviewers.find(r => r.id === review.reviewerId);
                            if (!reviewer) return null;
                            
                            return (
                              <div key={review.id}>
                                <div 
                                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:scale-[1.02] ${
                                    selectedReviewersToRemove.includes(reviewer.id)
                                      ? 'border-red-400 bg-red-50/90 shadow-md ring-2 ring-red-200/50'
                                      : 'border-gray-200 bg-white/90 hover:border-red-300 hover:bg-red-50/50'
                                  }`}
                                  onClick={() => handleReviewerRemovalToggle(reviewer.id)}
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className="relative">
                                      {selectedReviewersToRemove.includes(reviewer.id) && (
                                        <div className="absolute -inset-1 bg-red-200/60 rounded-full animate-ping"></div>
                                      )}
                                    </div>
                                    
                                    <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
                                      <AvatarImage 
                                        src={reviewer.profileImage || `https://ui-avatars.com/api/?name=${reviewer.name}&background=random`}
                                        alt={reviewer.name || "Reviewer Avatar"}
                                      />
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-gray-900 truncate text-lg">
                                        {reviewer.name || 'Unknown Reviewer'}
                                      </div>
                                      <div className="text-sm text-gray-500 truncate">
                                        {reviewer.email || 'No email provided'}
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={getStatusBadgeVariant(review.reviewerStatus)} className="text-xs">
                                          {review.reviewerStatus.replace(/_/g, " ")}
                                        </Badge>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <span className="text-xs text-gray-400">Currently Assigned</span>
                                      </div>
                                    </div>
                                    
                                    <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                      selectedReviewersToRemove.includes(reviewer.id) 
                                        ? 'bg-red-500 shadow-lg ring-2 ring-red-200' 
                                        : 'bg-gray-300 group-hover:bg-red-400'
                                    }`}></div>
                                  </div>
                                </div>
                                
                                {index < (selectedPaper?.reviews?.length || 0) - 1 && (
                                  <Separator className="my-3 bg-gray-200/60" />
                                )}
                              </div>
                            );
                          })}
                          
                          {(!selectedPaper?.reviews || selectedPaper.reviews.length === 0) && (
                            <div className="text-center py-12 text-gray-500">
                              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">No reviewers assigned</p>
                              <p className="text-sm">This paper has no assigned reviewers</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right Column: Available Reviewers to Add */}
                    <Card className="bg-green-50/70 backdrop-blur-sm border-green-200/60">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-green-600" />
                            Available to Add
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAllReviewers}
                            className="bg-white/90 hover:bg-white border-green-300"
                          >
                            {(() => {
                              const availableReviewers = reviewers.filter(reviewer => {
                                const isAlreadyAssigned = selectedPaper?.reviews?.some((review: reviews) => review.reviewerId === reviewer.id);
                                return !isAlreadyAssigned;
                              });
                              const allAvailableSelected = availableReviewers.every(reviewer => selectedReviewers.includes(reviewer.id));
                              return allAvailableSelected && availableReviewers.length > 0 ? "Deselect All" : "Select All Available";
                            })()}
                          </Button>
                        </div>
                        {selectedReviewers.length > 0 && (
                          <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50/90 px-4 py-3 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <strong>{selectedReviewers.length}</strong> reviewer{selectedReviewers.length !== 1 ? 's' : ''} to add
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="h-fit space-y-3 pr-2">
                          {reviewers.filter(reviewer => {
                            // Only show reviewers that are not currently assigned
                            const isAlreadyAssigned = selectedPaper?.reviews?.some((review: reviews) => review.reviewerId === reviewer.id);
                            return !isAlreadyAssigned;
                          }).map((reviewer, index, filteredReviewers) => (
                            <div key={reviewer.id}>
                              <div 
                                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:scale-[1.02] ${
                                  selectedReviewers.includes(reviewer.id)
                                    ? 'border-green-400 bg-green-50/90 shadow-md ring-2 ring-green-200/50'
                                    : 'border-gray-200 bg-white/90 hover:border-green-300 hover:bg-green-50/50'
                                }`}
                                onClick={() => handleReviewerToggle(reviewer.id)}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    {selectedReviewers.includes(reviewer.id) && (
                                      <div className="absolute -inset-1 bg-green-200/60 rounded-full animate-ping"></div>
                                    )}
                                  </div>
                                  
                                  <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
                                    <AvatarImage 
                                      src={reviewer.profileImage || `https://ui-avatars.com/api/?name=${reviewer.name}&background=random`}
                                      alt={reviewer.name || "Reviewer Avatar"}
                                    />
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 truncate text-lg">
                                      {reviewer.name || 'Unknown Reviewer'}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                      {reviewer.email || 'No email provided'}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        Reviewer
                                      </Badge>
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                      <span className="text-xs text-gray-400">Available</span>
                                    </div>
                                  </div>
                                  
                                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                    selectedReviewers.includes(reviewer.id) 
                                      ? 'bg-green-500 shadow-lg ring-2 ring-green-200' 
                                      : 'bg-gray-300 group-hover:bg-green-400'
                                  }`}></div>
                                </div>
                              </div>
                              
                              {index < filteredReviewers.length - 1 && (
                                <Separator className="my-3 bg-gray-200/60" />
                              )}
                            </div>
                          ))}
                          
                          {reviewers.filter(reviewer => {
                            const isAlreadyAssigned = selectedPaper?.reviews?.some((review: reviews) => review.reviewerId === reviewer.id);
                            return !isAlreadyAssigned;
                          }).length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">No available reviewers</p>
                              <p className="text-sm">All reviewers are already assigned</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {actionType === "PUBLISH" && (
                  <Card className="bg-gradient-to-r from-green-50/60 to-blue-50/60 border-green-200/60">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Publication</h3>
                          <p className="text-gray-600">
                            Are you sure you want to publish this paper? This action will make it publicly available.
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50/80 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Current Status:</strong> {selectedPaper.status.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

           
              {actionType === "PUBLISH" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to publish this paper? This action will make it publicly available.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Status:</strong> {selectedPaper ? selectedPaper.status : "Unknown"}<br/>
                     
                    </p>
                  </div>
                </div>
              )}
          
      

          <AlertDialogFooter className="border-t border-gray-200/60 pt-6 mt-6">
            <AlertDialogCancel 
              onClick={() => {
                setActionType(null);
                setSelectedPaper(null);
                setSelectedReviewers([]);
                setSelectedReviewersToRemove([]);
              }}
              className="bg-white/90 hover:bg-gray-50 border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionType === "ASSIGN_REVIEWER") handleAssignReviewer();
                else if (actionType === "REASSIGN_REVIEWER") handleReassignReviewer();
                else if (actionType === "PUBLISH") handlePublishPaper();
              }}
              disabled={
                (actionType === "ASSIGN_REVIEWER" && selectedReviewers.length === 0) ||
                (actionType === "REASSIGN_REVIEWER" && selectedReviewersToRemove.length === 0 && selectedReviewers.length === 0)
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {actionType === "ASSIGN_REVIEWER" && (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign {selectedReviewers.length > 0 ? `${selectedReviewers.length} ` : ''}Reviewer{selectedReviewers.length !== 1 ? 's' : ''}
                </>
              )}
              {actionType === "REASSIGN_REVIEWER" && (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Apply Changes
                  {(selectedReviewersToRemove.length > 0 || selectedReviewers.length > 0) && (
                    <span className="ml-1 text-xs opacity-90">
                      ({selectedReviewersToRemove.length > 0 && `-${selectedReviewersToRemove.length}`}
                      {selectedReviewers.length > 0 && `+${selectedReviewers.length}`})
                    </span>
                  )}
                </>
              )}
              {actionType === "PUBLISH" && "Publish Paper"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
