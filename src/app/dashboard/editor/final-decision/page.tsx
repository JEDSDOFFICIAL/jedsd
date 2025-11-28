"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Award,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Send,
  MoreVertical,
  FileText,
  User as UserIcon,
  Calendar,
  Tag,
  Star,
  Trash2,
  MoreHorizontal,
  Upload,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { ResearchPaper, PaperReview, User } from "@prisma/client";
import {
  fetchPapers,
  publishPaper,
  acceptPaper,
  rejectPaper,
  updatePaper,
  deletePapers,
} from "@/lib/Frontend-actions";
import { uploadFileToFirebase } from "@/lib/Firebase-Action";
import { AuthorOrContact } from "@/types/dataTypes";

// Extended interface to include relations
interface PaperReviewWithReviewer extends PaperReview {
  reviewer: User;
}

interface PaperWithRelations {
  id: string;
  paperId: string;
  doi: string | null;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  rating: number | null;
  coverLetterPath: string | null;
  editorDecisionFile?: string | null;
  editorDecision?: "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT" | null;
  editorComments?: string | null;
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

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form states
  const [editFormData, setEditFormData] = useState({
    title: "",
    abstract: "",
    keywords: [] as string[],
    rating: 0,
    filePath: "",
    coverLetterPath: "",
    doi: "",
    contributors: [] as AuthorOrContact[],
    pointOfContact: {
      fullName: "",
      email: "",
      affiliation: "",
      contactNumber: "",
    } as AuthorOrContact,
    submissionDate: "",
    acceptedDate: "",
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  // Decision form states
  const [decisionForm, setDecisionForm] = useState({
    decision: "MINOR_REVISION" as "ACCEPT" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT",
    comments: "",
    decisionFile: null as File | null,
  });

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
      const finalStatuses = ['EDITOR_DECISION', 'ACCEPTED', 'REJECTED', 'PUBLISH','ON_REVIEW'];
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

  const handleViewPaper = (paper: PaperWithRelations) => {
    setSelectedPaper(paper);
    setViewDialogOpen(true);
  };

  const handleViewDialogOpenChange = (open: boolean) => {
    setViewDialogOpen(open);
    if (!open) {
      // Reset after animation completes
      setTimeout(() => setSelectedPaper(null), 300);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setTimeout(() => setSelectedPaper(null), 300);
  };

  const handleEditPaper = (paper: PaperWithRelations) => {
    setSelectedPaper(paper);
    setEditFormData({
      title: paper.title,
      abstract: paper.abstract,
      keywords: paper.keywords,
      rating: paper.rating || 0,
      filePath: paper.filePath,
      coverLetterPath: paper.coverLetterPath || "",
      doi: paper.doi || "",
      contributors: paper.contributors || [],
      pointOfContact: paper.pointOfContact || {
        fullName: "",
        email: "",
        affiliation: "",
        contactNumber: "",
      },
      submissionDate: new Date(paper.submissionDate).toISOString().split('T')[0],
      acceptedDate: paper.acceptedDate ? new Date(paper.acceptedDate).toISOString().split('T')[0] : "",
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      // Reset after animation completes
      setTimeout(() => {
        setSelectedPaper(null);
        setEditFormData({
          title: "",
          abstract: "",
          keywords: [],
          rating: 0,
          filePath: "",
          coverLetterPath: "",
          doi: "",
          contributors: [],
          pointOfContact: {
            fullName: "",
            email: "",
            affiliation: "",
            contactNumber: "",
          },
          submissionDate: "",
          acceptedDate: "",
        });
        setNewKeyword("");
        setPaperFile(null);
        setCoverLetterFile(null);
      }, 300);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setTimeout(() => {
      setSelectedPaper(null);
      setEditFormData({
        title: "",
        abstract: "",
        keywords: [],
        rating: 0,
        filePath: "",
        coverLetterPath: "",
        doi: "",
        contributors: [],
        pointOfContact: {
          fullName: "",
          email: "",
          affiliation: "",
          contactNumber: "",
        },
        submissionDate: "",
        acceptedDate: "",
      });
      setNewKeyword("");
      setPaperFile(null);
      setCoverLetterFile(null);
    }, 300);
  };

  const handleUpdatePaper = async () => {
    if (!selectedPaper) return;

    try {
      setActionLoading(true);
      const toastId = toast.loading("Updating paper...");

      let uploadedPaperUrl = editFormData.filePath;
      let uploadedCoverLetterUrl = editFormData.coverLetterPath;

      // Upload new paper file if provided
      if (paperFile) {
        toast.loading("Uploading paper file...", { id: toastId });
        const paperUrl = await uploadFileToFirebase(
          paperFile,
          `research-papers/${selectedPaper.id}`
        );
        if (!paperUrl) {
          toast.error("Failed to upload paper file", { id: toastId });
          setActionLoading(false);
          return;
        }
        uploadedPaperUrl = paperUrl;
      }

      // Upload new cover letter if provided
      if (coverLetterFile) {
        toast.loading("Uploading cover letter...", { id: toastId });
        const coverUrl = await uploadFileToFirebase(
          coverLetterFile,
          `cover-letters/${selectedPaper.id}`
        );
        if (!coverUrl) {
          toast.error("Failed to upload cover letter", { id: toastId });
          setActionLoading(false);
          return;
        }
        uploadedCoverLetterUrl = coverUrl;
      }

      toast.loading("Saving changes...", { id: toastId });
      await updatePaper(selectedPaper.paperId, {
        title: editFormData.title,
        abstract: editFormData.abstract,
        keywords: editFormData.keywords,
        rating: editFormData.rating,
        filePath: uploadedPaperUrl,
        coverLetterPath: uploadedCoverLetterUrl || null,
        doi: editFormData.doi || null,
        contributors: editFormData.contributors,
        pointOfContact: editFormData.pointOfContact,
        submissionDate: editFormData.submissionDate ? new Date(editFormData.submissionDate) : undefined,
        acceptedDate: editFormData.acceptedDate ? new Date(editFormData.acceptedDate) : null,
      });
      
      toast.success("Paper updated successfully!", { id: toastId });
      handleCloseEditDialog();
      fetchFinalPapers();
    } catch (error) {
      console.error("Failed to update paper:", error);
      toast.error("Failed to update paper");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptPaper = async () => {
    if (!selectedPaper) return;

    try {
      setActionLoading(true);
      await acceptPaper(selectedPaper.id);
      setAcceptDialogOpen(false);
      setTimeout(() => setSelectedPaper(null), 300);
      fetchFinalPapers();
    } catch (error) {
      console.error("Failed to accept paper:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPaper = async () => {
    if (!selectedPaper) return;

    try {
      setActionLoading(true);
      await rejectPaper(selectedPaper.id);
      setRejectDialogOpen(false);
      setTimeout(() => setSelectedPaper(null), 300);
      fetchFinalPapers();
    } catch (error) {
      console.error("Failed to reject paper:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishPaper = async () => {
    if (!selectedPaper) return;

    try {
      setActionLoading(true);
      await publishPaper(selectedPaper.id);
      setPublishDialogOpen(false);
      setTimeout(() => setSelectedPaper(null), 300);
      fetchFinalPapers();
    } catch (error) {
      console.error("Failed to publish paper:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !editFormData.keywords.includes(newKeyword.trim())) {
      setEditFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setEditFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleDeletePaper = async () => {
    if (!selectedPaper) return;

    try {
      setActionLoading(true);
      await deletePapers(selectedPaper.id);
      setDeleteDialogOpen(false);
      setTimeout(() => setSelectedPaper(null), 300);
      fetchFinalPapers();
    } catch (error) {
      console.error("Failed to delete paper:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle alert dialog close with proper cleanup
  const handleCloseAcceptDialog = (open: boolean) => {
    setAcceptDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedPaper(null), 300);
    }
  };

  const handleCloseRejectDialog = (open: boolean) => {
    setRejectDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedPaper(null), 300);
    }
  };

  const handleClosePublishDialog = (open: boolean) => {
    setPublishDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedPaper(null), 300);
    }
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedPaper(null), 300);
    }
  };

  const handleOpenDecisionDialog = (paper: PaperWithRelations) => {
    setSelectedPaper(paper);
    setDecisionDialogOpen(true);
  };

  const handleCloseDecisionDialog = (open: boolean) => {
    setDecisionDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedPaper(null);
        setDecisionForm({
          decision: "MINOR_REVISION",
          comments: "",
          decisionFile: null,
        });
      }, 300);
    }
  };

  const handleDecisionFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setDecisionForm(prev => ({ ...prev, decisionFile: file }));
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleSubmitDecision = async () => {
    if (!selectedPaper) return;

    if (!decisionForm.comments.trim()) {
      toast.error("Please provide comments for your decision");
      return;
    }

    try {
      setActionLoading(true);
      const toastId = toast.loading("Submitting decision...");

      let uploadedFileUrl = null;

      // Upload decision file if provided
      if (decisionForm.decisionFile) {
        toast.loading("Uploading decision document...", { id: toastId });
        uploadedFileUrl = await uploadFileToFirebase(
          decisionForm.decisionFile,
          `editor-decisions/${selectedPaper.id}`
        );

        if (!uploadedFileUrl) {
          toast.error("Failed to upload decision document", { id: toastId });
          setActionLoading(false);
          return;
        }
      }

      // Submit the decision
      toast.loading("Saving decision...", { id: toastId });
      await updatePaper(selectedPaper.paperId, {
        editorDecision: decisionForm.decision,
        editorComments: decisionForm.comments,
        editorDecisionFile: uploadedFileUrl,
      });

      toast.success("Decision submitted successfully!", { id: toastId });
      handleCloseDecisionDialog(false);
      fetchFinalPapers();
    } catch (error) {
      console.error("Failed to submit decision:", error);
      toast.error("Failed to submit decision");
    } finally {
      setActionLoading(false);
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
          const paper = row.original;
          const status = paper.status;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Paper Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleViewPaper(paper)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleEditPaper(paper)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Paper
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {(status === "EDITOR_DECISION" || status === "ON_REVIEW") && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleOpenDecisionDialog(paper)}
                      className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Make Decision
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPaper(paper);
                        setAcceptDialogOpen(true);
                      }}
                      className="text-green-600 focus:text-green-700 focus:bg-green-50"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Paper
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPaper(paper);
                        setRejectDialogOpen(true);
                      }}
                      className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Paper
                    </DropdownMenuItem>
                  </>
                )}
                
                {status === "ACCEPTED" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPaper(paper);
                      setPublishDialogOpen(true);
                    }}
                    className="text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Publish Paper
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaper(paper);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Paper
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* View Paper Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={handleViewDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Paper Details</DialogTitle>
            <DialogDescription>
              Complete information about the research paper
            </DialogDescription>
          </DialogHeader>
          {selectedPaper && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Title
                </Label>
                <p className="mt-2 text-sm">{selectedPaper.title}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-semibold">Abstract</Label>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {selectedPaper.abstract}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Author
                  </Label>
                  <p className="mt-2 text-sm">{selectedPaper.author?.name || "Unknown"}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </Label>
                  <p className="mt-2 text-sm">
                    {selectedPaper.rating ? `${selectedPaper.rating}/5` : "Not rated"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Submitted
                  </Label>
                  <p className="mt-2 text-sm">
                    {new Date(selectedPaper.submissionDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedPaper.acceptedDate && (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Accepted
                    </Label>
                    <p className="mt-2 text-sm">
                      {new Date(selectedPaper.acceptedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Keywords
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPaper.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Status</Label>
                <div className="mt-2">
                  <Badge
                    variant={
                      selectedPaper.status === "PUBLISH" ? "default" :
                      selectedPaper.status === "ACCEPTED" ? "secondary" :
                      selectedPaper.status === "REJECTED" ? "destructive" :
                      "outline"
                    }
                  >
                    {selectedPaper.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>

              {selectedPaper.reviews && selectedPaper.reviews.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold">Reviews ({selectedPaper.reviews.length})</Label>
                    <div className="mt-2 space-y-3">
                      {selectedPaper.reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-medium">
                                Reviewer: {review.reviewer?.name || "Anonymous"}
                              </p>
                              {review.rating && (
                                <Badge variant="outline">{review.rating}/5</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.reviewText}</p>
                            {review.reviewerStatus && (
                              <Badge className="mt-2" variant="secondary">
                                {review.reviewerStatus.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseViewDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Paper Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Paper Details</DialogTitle>
            <DialogDescription>
              Update all paper information, metadata, and associated files
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Paper title"
                />
              </div>

              <div>
                <Label htmlFor="edit-doi">DOI (Digital Object Identifier)</Label>
                <Input
                  id="edit-doi"
                  value={editFormData.doi}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, doi: e.target.value }))}
                  placeholder="10.xxxx/xxxxx (optional)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: 10.1234/example.2024.001
                </p>
              </div>

              <div>
                <Label htmlFor="edit-abstract">Abstract *</Label>
                <Textarea
                  id="edit-abstract"
                  value={editFormData.abstract}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, abstract: e.target.value }))}
                  placeholder="Paper abstract"
                  className="min-h-[150px]"
                />
              </div>

              <div>
                <Label htmlFor="edit-rating">Rating (0-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editFormData.rating}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-submission-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Submission Date
                  </Label>
                  <Input
                    id="edit-submission-date"
                    type="date"
                    value={editFormData.submissionDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, submissionDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-accepted-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Accepted Date (Optional)
                  </Label>
                  <Input
                    id="edit-accepted-date"
                    type="date"
                    value={editFormData.acceptedDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, acceptedDate: e.target.value }))}
                  />
                  {editFormData.acceptedDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditFormData(prev => ({ ...prev, acceptedDate: "" }))}
                      className="mt-1 h-6 text-xs"
                    >
                      Clear Date
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddKeyword}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {editFormData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Files
              </h3>

              <div>
                <Label htmlFor="edit-paper-file">Research Paper (PDF)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Current file: {editFormData.filePath ? "Uploaded" : "No file"}
                </p>
                <Input
                  id="edit-paper-file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== "application/pdf") {
                        toast.error("Please upload a PDF file");
                        return;
                      }
                      if (file.size > 20 * 1024 * 1024) {
                        toast.error("File size must be less than 20MB");
                        return;
                      }
                      setPaperFile(file);
                      toast.success(`File "${file.name}" selected`);
                    }
                  }}
                />
                {paperFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{paperFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaperFile(null)}
                      className="ml-auto"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="edit-cover-letter">Cover Letter (Optional, PDF)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Current file: {editFormData.coverLetterPath ? "Uploaded" : "No file"}
                </p>
                <Input
                  id="edit-cover-letter"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== "application/pdf") {
                        toast.error("Please upload a PDF file");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("File size must be less than 10MB");
                        return;
                      }
                      setCoverLetterFile(file);
                      toast.success(`File "${file.name}" selected`);
                    }
                  }}
                />
                {coverLetterFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{coverLetterFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCoverLetterFile(null)}
                      className="ml-auto"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Point of Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Point of Contact
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="poc-name">Full Name *</Label>
                  <Input
                    id="poc-name"
                    value={editFormData.pointOfContact.fullName}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      pointOfContact: { ...prev.pointOfContact, fullName: e.target.value }
                    }))}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <Label htmlFor="poc-email">Email *</Label>
                  <Input
                    id="poc-email"
                    type="email"
                    value={editFormData.pointOfContact.email}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      pointOfContact: { ...prev.pointOfContact, email: e.target.value }
                    }))}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="poc-affiliation">Affiliation *</Label>
                  <Input
                    id="poc-affiliation"
                    value={editFormData.pointOfContact.affiliation}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      pointOfContact: { ...prev.pointOfContact, affiliation: e.target.value }
                    }))}
                    placeholder="Institution"
                  />
                </div>

                <div>
                  <Label htmlFor="poc-contact">Contact Number *</Label>
                  <Input
                    id="poc-contact"
                    value={editFormData.pointOfContact.contactNumber}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      pointOfContact: { ...prev.pointOfContact, contactNumber: e.target.value }
                    }))}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contributors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Contributors ({editFormData.contributors.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditFormData(prev => ({
                      ...prev,
                      contributors: [
                        ...prev.contributors,
                        { fullName: "", email: "", affiliation: "", contactNumber: "" }
                      ]
                    }));
                  }}
                >
                  Add Contributor
                </Button>
              </div>

              <div className="space-y-4">
                {editFormData.contributors.map((contributor, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-semibold">Contributor {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditFormData(prev => ({
                            ...prev,
                            contributors: prev.contributors.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`contrib-name-${index}`}>Full Name *</Label>
                        <Input
                          id={`contrib-name-${index}`}
                          value={contributor.fullName}
                          onChange={(e) => {
                            const newContributors = [...editFormData.contributors];
                            newContributors[index].fullName = e.target.value;
                            setEditFormData(prev => ({ ...prev, contributors: newContributors }));
                          }}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contrib-email-${index}`}>Email *</Label>
                        <Input
                          id={`contrib-email-${index}`}
                          type="email"
                          value={contributor.email}
                          onChange={(e) => {
                            const newContributors = [...editFormData.contributors];
                            newContributors[index].email = e.target.value;
                            setEditFormData(prev => ({ ...prev, contributors: newContributors }));
                          }}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contrib-affiliation-${index}`}>Affiliation *</Label>
                        <Input
                          id={`contrib-affiliation-${index}`}
                          value={contributor.affiliation}
                          onChange={(e) => {
                            const newContributors = [...editFormData.contributors];
                            newContributors[index].affiliation = e.target.value;
                            setEditFormData(prev => ({ ...prev, contributors: newContributors }));
                          }}
                          placeholder="Institution"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contrib-contact-${index}`}>Contact Number *</Label>
                        <Input
                          id={`contrib-contact-${index}`}
                          value={contributor.contactNumber}
                          onChange={(e) => {
                            const newContributors = [...editFormData.contributors];
                            newContributors[index].contactNumber = e.target.value;
                            setEditFormData(prev => ({ ...prev, contributors: newContributors }));
                          }}
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {editFormData.contributors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contributors added. Click "Add Contributor" to add one.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePaper} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Paper"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Paper Confirmation */}
      <AlertDialog open={acceptDialogOpen} onOpenChange={handleCloseAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Accept Paper for Publication
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept <strong>{selectedPaper?.title}</strong> for publication?
              This will change the paper status to "ACCEPTED" and notify the author.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptPaper}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Accepting..." : "Accept Paper"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Paper Confirmation */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={handleCloseRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Paper
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject <strong>{selectedPaper?.title}</strong>?
              This will change the paper status to "REJECTED" and notify the author.
              This action can be reversed later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectPaper}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Rejecting..." : "Reject Paper"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Paper Confirmation */}
      <AlertDialog open={publishDialogOpen} onOpenChange={handleClosePublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Publish Paper
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish <strong>{selectedPaper?.title}</strong>?
              This will make the paper publicly available and notify the author.
              This is the final step in the publication process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishPaper}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? "Publishing..." : "Publish Paper"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Paper Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Delete Paper
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedPaper?.title}</strong>?
              This action cannot be undone. All associated reviews and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePaper}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Deleting..." : "Delete Paper"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Make Decision Dialog */}
      <Dialog open={decisionDialogOpen} onOpenChange={handleCloseDecisionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Make Editorial Decision
            </DialogTitle>
            <DialogDescription>
              Provide your decision and feedback for <strong>{selectedPaper?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Decision Type */}
            <div className="space-y-2">
              <Label htmlFor="decision" className="text-sm font-semibold">
                Editorial Decision *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={decisionForm.decision === "ACCEPT" ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col items-center gap-2 ${
                    decisionForm.decision === "ACCEPT" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  onClick={() => setDecisionForm(prev => ({ ...prev, decision: "ACCEPT" }))}
                >
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">Accept</span>
                </Button>

                <Button
                  type="button"
                  variant={decisionForm.decision === "MINOR_REVISION" ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col items-center gap-2 ${
                    decisionForm.decision === "MINOR_REVISION" ? "bg-yellow-600 hover:bg-yellow-700" : ""
                  }`}
                  onClick={() => setDecisionForm(prev => ({ ...prev, decision: "MINOR_REVISION" }))}
                >
                  <AlertTriangle className="h-6 w-6" />
                  <span className="font-semibold">Minor Revision</span>
                </Button>

                <Button
                  type="button"
                  variant={decisionForm.decision === "MAJOR_REVISION" ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col items-center gap-2 ${
                    decisionForm.decision === "MAJOR_REVISION" ? "bg-orange-600 hover:bg-orange-700" : ""
                  }`}
                  onClick={() => setDecisionForm(prev => ({ ...prev, decision: "MAJOR_REVISION" }))}
                >
                  <AlertTriangle className="h-6 w-6" />
                  <span className="font-semibold">Major Revision</span>
                </Button>

                <Button
                  type="button"
                  variant={decisionForm.decision === "REJECT" ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col items-center gap-2 ${
                    decisionForm.decision === "REJECT" ? "bg-red-600 hover:bg-red-700" : ""
                  }`}
                  onClick={() => setDecisionForm(prev => ({ ...prev, decision: "REJECT" }))}
                >
                  <XCircle className="h-6 w-6" />
                  <span className="font-semibold">Reject</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="decision-comments" className="text-sm font-semibold">
                Comments to Author *
              </Label>
              <Textarea
                id="decision-comments"
                placeholder="Provide detailed feedback and justification for your decision. This will be shared with the author."
                value={decisionForm.comments}
                onChange={(e) => setDecisionForm(prev => ({ ...prev, comments: e.target.value }))}
                className="min-h-[150px] resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {decisionForm.comments.length} characters
              </p>
            </div>

            <Separator />

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="decision-file" className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Decision Document (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload a PDF document with detailed feedback, annotated manuscript, or decision letter
              </p>
              <div className="flex items-center gap-4">
                <Input
                  id="decision-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleDecisionFileUpload}
                  className="flex-1"
                />
                {decisionForm.decisionFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDecisionForm(prev => ({ ...prev, decisionFile: null }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {decisionForm.decisionFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  <span>{decisionForm.decisionFile.name}</span>
                  <span className="text-muted-foreground">
                    ({(decisionForm.decisionFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                PDF files only. Max file size: 10MB
              </p>
            </div>

            {/* Decision Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Decision Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Decision:</span>
                  <Badge className="ml-2" variant={
                    decisionForm.decision === "ACCEPT" ? "default" :
                    decisionForm.decision === "MINOR_REVISION" ? "secondary" :
                    decisionForm.decision === "MAJOR_REVISION" ? "outline" :
                    "destructive"
                  }>
                    {decisionForm.decision.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Document:</span>
                  <span className="ml-2">
                    {decisionForm.decisionFile ? "Attached" : "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleCloseDecisionDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDecision}
              disabled={actionLoading || !decisionForm.comments.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Decision
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}