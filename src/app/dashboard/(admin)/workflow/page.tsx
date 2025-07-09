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
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ResearchPaper } from "@prisma/client";
import { fetchPapers } from "@/lib/paperActions";
import { fetchReviewers, assignReviewer } from "@/lib/AssignReviewer";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";

interface PaperWithDetails extends ResearchPaper {
  author?: { name: string; email: string };
  reviewer?: { name: string; email: string };
  editor?: { name: string; email: string };
}

interface Reviewer {
  id: string;
  name: string;
  email: string;
}

interface Editor {
  id: string;
  name: string;
  email: string;
}

export default function AdminWorkflowManagement() {
  const { data: session } = useSession();
  const [papers, setPapers] = React.useState<PaperWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Workflow management states
  const [selectedPaper, setSelectedPaper] = React.useState<PaperWithDetails | null>(null);
  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [editors, setEditors] = React.useState<Editor[]>([]);
  const [selectedReviewer, setSelectedReviewer] = React.useState<string>("");
  const [selectedEditor, setSelectedEditor] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [actionType, setActionType] = React.useState<"ASSIGN_REVIEWER" | "ASSIGN_EDITOR" | "REASSIGN_EDITOR" | "PUBLISH" | null>(null);

  React.useEffect(() => {
    fetchAllPapers();
    loadReviewers();
    loadEditors();
    console.log("Workflow management initialized",papers);
  }, []);

  const fetchAllPapers = async () => {
    try {
      setLoading(true);
      const response = await fetchPapers({});
      if (response) {
        setPapers(response.papers || []);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    } finally {
      setLoading(false);
      console.log("papers fethced is ",papers)
    }
  };

  const loadReviewers = async () => {
    try {
      const reviewerData = await fetchReviewers();
      if (reviewerData) {
        setReviewers(reviewerData);
      }
    } catch (error) {
      console.error("Error fetching reviewers:", error);
    }
  };

  const loadEditors = async () => {
  try {
    

    // Fetch EDITOR users
    const editorResponse = await axios.get("/api/user/getUser?userType=ADMIN&userType=EDITOR");
    console.log("Editor response data:", editorResponse.data);
    setEditors(editorResponse.data.users || []);
  } catch (error) {
    console.error("Error fetching editors:", error);
    toast.error("Failed to load editors");
  }
};


  const handleAssignReviewer = async () => {
    if (!selectedPaper || !selectedReviewer) {
      toast.error("Please select a reviewer");
      return;
    }

    try {
      await assignReviewer(selectedPaper.id, selectedReviewer, "ON_REVIEW", () => {
        toast.success("Reviewer assigned successfully");
        setSelectedPaper(null);
        setSelectedReviewer("");
        setActionType(null);
        fetchAllPapers();
      });
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      toast.error("Failed to assign reviewer");
    }
  };

  const handleAssignEditor = async () => {
    if (!selectedPaper || !selectedEditor) {
      toast.error("Please select an editor");
      return;
    }

    try {
      const response = await fetch("/api/paper/assign-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: selectedPaper.id,
          editorId: selectedEditor,
        }),
      });

      if (response.ok) {
        toast.success("Editor assigned successfully");
        setSelectedPaper(null);
        setSelectedEditor("");
        setActionType(null);
        fetchAllPapers();
      } else {
        toast.error("Failed to assign editor");
      }
    } catch (error) {
      console.error("Error assigning editor:", error);
      toast.error("Failed to assign editor");
    }
  };

  const handleReassignEditor = async () => {
    if (!selectedPaper || !selectedEditor) {
      toast.error("Please select a new editor");
      return;
    }

    try {
      const response = await fetch("/api/paper/assign-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: selectedPaper.id,
          editorId: selectedEditor,
          isReassignment: true,
        }),
      });

      if (response.ok) {
        toast.success("Editor reassigned successfully");
        setSelectedPaper(null);
        setSelectedEditor("");
        setActionType(null);
        fetchAllPapers();
      } else {
        toast.error("Failed to reassign editor");
      }
    } catch (error) {
      console.error("Error reassigning editor:", error);
      toast.error("Failed to reassign editor");
    }
  };

  const handlePublishPaper = async () => {
    if (!selectedPaper) return;

    try {
      const response = await fetch("/api/paper/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: selectedPaper.id,
        }),
      });

      if (response.ok) {
        toast.success("Paper published successfully");
        setSelectedPaper(null);
        setActionType(null);
        fetchAllPapers();
      } else {
        toast.error("Failed to publish paper");
      }
    } catch (error) {
      console.error("Error publishing paper:", error);
      toast.error("Failed to publish paper");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "UPLOAD": return "secondary";
      case "REVIEWER_ALLOCATION": return "outline";
      case "ON_REVIEW": return "default";
      case "EDITOR_ALLOCATION": return "outline";
      case "ON_EDIT": return "default";
      case "PUBLISH": return "destructive";
      case "ACCEPTED": return "destructive";
      case "REJECTED": return "destructive";
      default: return "secondary";
    }
  };

  const canAssignReviewer = (paper: PaperWithDetails) => {
    return paper.status === "UPLOAD" || paper.status === "REVIEWER_ALLOCATION";
  };

  const canAssignEditor = (paper: PaperWithDetails) => {
    return paper.reviewerStatus === "ACCEPTED_FOR_PUBLICATION" && 
           (paper.status === "EDITOR_ALLOCATION" || !paper.editorId);
  };

  const canReassignEditor = (paper: PaperWithDetails) => {
    return paper.editorId && 
           (paper.editorStatus === "PENDING" || 
            paper.editorStatus === "REJECTED_FOR_EDIT" || 
            paper.editorStatus === "REJECTED_FOR_PUBLICATION");
  };

  const canPublish = (paper: PaperWithDetails) => {
    return paper.editorStatus === "ACCEPTED_FOR_PUBLICATION";
  };

  const filteredPapers = React.useMemo(() => {
    if (statusFilter === "ALL") return papers;
    return papers.filter(paper => paper.status === statusFilter);
  }, [papers, statusFilter]);

  const columns: ColumnDef<PaperWithDetails>[] = [
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
      accessorKey: "reviewerStatus",
      header: "Reviewer",
      cell: ({ row }) => {
        const status = row.getValue("reviewerStatus") as string;
        const reviewer = row.original.reviewer;
        return (
          <div className="text-sm">
            {reviewer ? (
              <div>
                <div className="font-medium">{reviewer.name}</div>
                <Badge variant="outline" className="text-xs">
                  {status}
                </Badge>
              </div>
            ) : (
              <span className="text-gray-500">Not assigned</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "editorStatus",
      header: "Editor",
      cell: ({ row }) => {
        const status = row.getValue("editorStatus") as string;
        const editor = row.original.editor;
        return (
          <div className="text-sm">
            {editor ? (
              <div>
                <div className="font-medium">{editor.name}</div>
                <Badge variant="outline" className="text-xs">
                  {status}
                </Badge>
              </div>
            ) : (
              <span className="text-gray-500">Not assigned</span>
            )}
          </div>
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
              
              {canAssignEditor(paper) && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setActionType("ASSIGN_EDITOR");
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Editor
                </DropdownMenuItem>
              )}

              {canReassignEditor(paper) && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setActionType("REASSIGN_EDITOR");
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Reassign Editor
                </DropdownMenuItem>
              )}
              
              {canPublish(paper) && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setActionType("PUBLISH");
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish Paper
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading workflow data...</span>
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
            <div className="text-2xl font-bold">{papers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => p.status === "ON_REVIEW").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Being Edited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => p.status === "ON_EDIT").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => p.status === "PUBLISH").length}
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
          {/* Filters */}
          <div className="flex items-center gap-4 py-4">
            <Input
              placeholder="Search papers..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="UPLOAD">Uploaded</SelectItem>
                <SelectItem value="REVIEWER_ALLOCATION">Reviewer Allocation</SelectItem>
                <SelectItem value="ON_REVIEW">Under Review</SelectItem>
                <SelectItem value="EDITOR_ALLOCATION">Editor Allocation</SelectItem>
                <SelectItem value="ON_EDIT">Being Edited</SelectItem>
                <SelectItem value="PUBLISH">Published</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Papers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
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
                      No papers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialogs */}
      <Dialog 
        open={!!actionType} 
        onOpenChange={() => {
          setActionType(null);
          setSelectedPaper(null);
          setSelectedReviewer("");
          setSelectedEditor("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "ASSIGN_REVIEWER" && "Assign Reviewer"}
              {actionType === "ASSIGN_EDITOR" && "Assign Editor"}
              {actionType === "REASSIGN_EDITOR" && "Reassign Editor"}
              {actionType === "PUBLISH" && "Publish Paper"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPaper && (
            <div className="space-y-4">
              <div>
                <Label>Paper Title</Label>
                <p className="text-sm text-gray-600 font-medium">
                  {selectedPaper.title}
                </p>
              </div>

              {actionType === "ASSIGN_REVIEWER" && (
                <div>
                  <Label htmlFor="reviewer">Select Reviewer</Label>
                  <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {reviewers.map((reviewer) => (
                        <SelectItem key={reviewer.id} value={reviewer.id}>
                          {reviewer.name} ({reviewer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {actionType === "ASSIGN_EDITOR" && (
                <div>
                  <Label htmlFor="editor">Select Editor</Label>
                  <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an editor" />
                    </SelectTrigger>
                    <SelectContent>
                      {editors.map((editor) => (
                        <SelectItem key={editor.id} value={editor.id}>
                          {editor.name} ({editor.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {actionType === "REASSIGN_EDITOR" && (
                <div>
                  <Label htmlFor="editor">Select New Editor</Label>
                  <div className="mb-2 text-sm text-muted-foreground">
                    Current Editor: {selectedPaper?.editor?.name || selectedPaper?.editor?.email || "Unknown"}
                  </div>
                  <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a new editor" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        editors.map((editor,index) => (
                          <SelectItem key={index} value={editor.id}>
                            {editor.name} ({editor.id})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}

              {actionType === "PUBLISH" && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to publish this paper? This action will make it publicly available.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Status:</strong> {selectedPaper.status}<br/>
                      <strong>Editor Status:</strong> {selectedPaper.editorStatus}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActionType(null);
                    setSelectedPaper(null);
                    setSelectedReviewer("");
                    setSelectedEditor("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (actionType === "ASSIGN_REVIEWER") handleAssignReviewer();
                    else if (actionType === "ASSIGN_EDITOR") handleAssignEditor();
                    else if (actionType === "REASSIGN_EDITOR") handleReassignEditor();
                    else if (actionType === "PUBLISH") handlePublishPaper();
                  }}
                  disabled={
                    (actionType === "ASSIGN_REVIEWER" && !selectedReviewer) ||
                    (actionType === "ASSIGN_EDITOR" && !selectedEditor) ||
                    (actionType === "REASSIGN_EDITOR" && !selectedEditor)
                  }
                >
                  {actionType === "ASSIGN_REVIEWER" && "Assign Reviewer"}
                  {actionType === "ASSIGN_EDITOR" && "Assign Editor"}
                  {actionType === "REASSIGN_EDITOR" && "Reassign Editor"}
                  {actionType === "PUBLISH" && "Publish Paper"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
