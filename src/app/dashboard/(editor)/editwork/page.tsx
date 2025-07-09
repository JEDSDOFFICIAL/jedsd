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
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Eye,
  FileText,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PaperWithDetails extends ResearchPaper {
  author?: { name: string; email: string };
  reviewer?: { name: string; email: string };
  editor?: { name: string; email: string };
}

export default function EditorWorkPage() {
  const { data: session } = useSession();
  const [papers, setPapers] = React.useState<PaperWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedPaper, setSelectedPaper] = React.useState<PaperWithDetails | null>(null);
  const [editFeedback, setEditFeedback] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<"ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION">("ACCEPTED_FOR_PUBLICATION");
  const [currentStep, setCurrentStep] = React.useState<"EDITING" | "PUBLICATION_DECISION">("EDITING");
  const [editingFeedback, setEditingFeedback] = React.useState("");

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchEditorPapers();
    }
  }, [session]);

  console.log("session user id is ", session?.user?.id);
  const fetchEditorPapers = async () => {
    try {
      setLoading(true);
      // Fetch papers that are assigned to this editor and either need editing or need publication decision
      const response = await fetchPapers({
        editorId: session?.user?.id,
      });
      console.log("Fetched papers:", response);
      if (response) {
        // Filter papers that are either ON_EDIT or need publication decision
        const relevantPapers = response.papers?.filter((paper: any) => 
          paper.status === "ON_EDIT" || 
          (paper.editorStatus === "ACCEPTED_FOR_EDIT" && paper.editorStatus !== "ACCEPTED_FOR_PUBLICATION" && paper.editorStatus !== "REJECTED_FOR_PUBLICATION")
        );
        setPapers(relevantPapers || []);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const submitEditingComplete = async (paperId: string) => {
    try {
      const response = await fetch("/api/paper/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          reviewText: editingFeedback,
          editorId: session?.user?.id,
          editorStatus: "ACCEPTED_FOR_EDIT", // Mark editing as complete
        }),
      });

      if (response.ok) {
        toast.success("Editing marked as complete. Now make publication decision.");
        setCurrentStep("PUBLICATION_DECISION");
        setEditingFeedback("");
      } else {
        toast.error("Failed to submit editing completion");
      }
    } catch (error) {
      console.error("Error submitting editing completion:", error);
      toast.error("An error occurred");
    }
  };

  const submitPublicationDecision = async (paperId: string) => {
    try {
      const response = await fetch("/api/paper/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          reviewText: editFeedback,
          editorId: session?.user?.id,
          editorStatus: editStatus, // ACCEPTED_FOR_PUBLICATION or REJECTED_FOR_PUBLICATION
        }),
      });

      if (response.ok) {
        toast.success(`Paper ${editStatus === "ACCEPTED_FOR_PUBLICATION" ? "accepted" : "rejected"} for publication`);
        setSelectedPaper(null);
        setEditFeedback("");
        setEditingFeedback("");
        setCurrentStep("EDITING");
        fetchEditorPapers();
      } else {
        toast.error("Failed to submit publication decision");
      }
    } catch (error) {
      console.error("Error submitting publication decision:", error);
      toast.error("An error occurred");
    }
  };

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
        <div className="max-w-[300px] truncate">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => row.original.author?.name || "Unknown",
    },
    {
      accessorKey: "submissionDate",
      header: "Submitted",
      cell: ({ row }) => {
        const date = new Date(row.getValue("submissionDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "ON_EDIT" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "editorStatus",
      header: "Editor Status",
      cell: ({ row }) => {
        const status = row.getValue("editorStatus") as string;
        const getVariant = () => {
          switch (status) {
            case "PENDING": return "outline";
            case "ACCEPTED_FOR_EDIT": return "default";
            case "ACCEPTED_FOR_PUBLICATION": return "default";
            case "REJECTED_FOR_PUBLICATION": return "destructive";
            default: return "secondary";
          }
        };
        const getDisplayText = () => {
          switch (status) {
            case "PENDING": return "Needs Editing";
            case "ACCEPTED_FOR_EDIT": return "Editing Complete - Needs Publication Decision";
            case "ACCEPTED_FOR_PUBLICATION": return "Accepted for Publication";
            case "REJECTED_FOR_PUBLICATION": return "Rejected for Publication";
            default: return status;
          }
        };
        return (
          <Badge variant={getVariant()}>
            {getDisplayText()}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const paper = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.open(paper.filePath, "_blank")}>
                <Eye className="mr-2 h-4 w-4" />
                View Paper
              </DropdownMenuItem>
              {paper.editorStatus === "PENDING" && (
                <DropdownMenuItem onClick={() => {
                  setSelectedPaper(paper);
                  setCurrentStep("EDITING");
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Complete Editing
                </DropdownMenuItem>
              )}
              {paper.editorStatus === "ACCEPTED_FOR_EDIT" && (
                <DropdownMenuItem onClick={() => {
                  setSelectedPaper(paper);
                  setCurrentStep("PUBLICATION_DECISION");
                }}>
                  <FileText className="mr-2 h-4 w-4" />
                  Publication Decision
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: papers,
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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="w-full space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editor Work Panel - Papers for Editing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter papers..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
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
                      No papers assigned for editing.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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

      {/* Editor Review Dialog */}
      <Dialog open={!!selectedPaper} onOpenChange={() => {
        setSelectedPaper(null);
        setCurrentStep("EDITING");
        setEditFeedback("");
        setEditingFeedback("");
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentStep === "EDITING" ? "Complete Paper Editing" : "Publication Decision"}
            </DialogTitle>
          </DialogHeader>
          {selectedPaper && (
            <div className="space-y-4">
              <div>
                <Label>Paper Title</Label>
                <p className="text-sm text-gray-600">{selectedPaper.title}</p>
              </div>
              <div>
                <Label>Author</Label>
                <p className="text-sm text-gray-600">{selectedPaper.author?.name}</p>
              </div>
              <div>
                <Label>Current Status</Label>
                <p className="text-sm text-gray-600">
                  Paper Status: {selectedPaper.status} | Editor Status: {selectedPaper.editorStatus}
                </p>
              </div>

              {currentStep === "EDITING" && (
                <>
                  <div>
                    <Label htmlFor="editingFeedback">Editing Notes & Changes Made</Label>
                    <Textarea
                      id="editingFeedback"
                      placeholder="Describe the edits you made to improve the paper..."
                      value={editingFeedback}
                      onChange={(e) => setEditingFeedback(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedPaper(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => submitEditingComplete(selectedPaper.id)}
                      disabled={!editingFeedback.trim()}
                    >
                      Mark Editing Complete
                    </Button>
                  </div>
                </>
              )}

              {currentStep === "PUBLICATION_DECISION" && (
                <>
                  <div>
                    <Label htmlFor="editStatus">Publication Decision</Label>
                    <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACCEPTED_FOR_PUBLICATION">Accept for Publication</SelectItem>
                        <SelectItem value="REJECTED_FOR_PUBLICATION">Reject for Publication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editFeedback">Publication Decision Rationale</Label>
                    <Textarea
                      id="editFeedback"
                      placeholder="Explain your decision to accept or reject for publication..."
                      value={editFeedback}
                      onChange={(e) => setEditFeedback(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep("EDITING")}>
                      Back to Editing
                    </Button>
                    <Button 
                      onClick={() => submitPublicationDecision(selectedPaper.id)}
                      disabled={!editFeedback.trim()}
                      variant={editStatus === "ACCEPTED_FOR_PUBLICATION" ? "default" : "destructive"}
                    >
                      {editStatus === "ACCEPTED_FOR_PUBLICATION" ? "Accept for Publication" : "Reject for Publication"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
