"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowUpDown,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Download,
  Grid3x3,
  List,
  Calendar,
  User,
  Tag,
  Clock,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { fetchReviewerPapers, reviewerAcceptancy } from "@/lib/Frontend-actions";
import { PaperWithRelations, PaginationInfo } from "@/types/dataTypes";
import { format, formatDistanceToNow } from "date-fns";
import { ViewPaperModal } from "@/components/view-paper-modal";

export default function AllocatedPapersPage() {
  const { data: session, status: sessionStatus } = useSession();
  
  // State Management
  const [papers, setPapers] = useState<PaperWithRelations[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<PaperWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  // Utility Functions
  const getUserReviewStatus = (paper: PaperWithRelations) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    return userReview?.reviewerStatus || "PENDING";
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "ACCEPTED_FOR_REVIEW":
        return "default";
      case "REJECTED_FOR_REVIEW":
        return "destructive";
      case "ACCEPTED_FOR_PUBLICATION":
      case "REJECTED_FOR_PUBLICATION":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      PENDING: "Pending Response",
      ACCEPTED_FOR_REVIEW: "Accepted",
      REJECTED_FOR_REVIEW: "Rejected",
      ACCEPTED_FOR_PUBLICATION: "Review Complete - Accept",
      REJECTED_FOR_PUBLICATION: "Review Complete - Reject",
    };
    return labels[status] || status;
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = papers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(paper => {
        const status = getUserReviewStatus(paper);
        return status === statusFilter;
      });
    }

    setFilteredPapers(filtered);
  }, [papers, searchTerm, statusFilter]);

  // Load reviewer papers
  const loadReviewerPapers = async (page: number = 1, limit: number = 20) => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetchReviewerPapers(session.user.id, page, limit);
      if (response && response.data) {
        setPapers(response.data);
        setPagination({
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: response.total || 0,
          limit: response.limit || 20,
        });
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error("Error fetching reviewer papers:", error);
      toast.error("Failed to load your assigned papers.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Event Handlers
  const handleReviewerAcceptance = async (
    paperId: string, 
    action: "ACCEPTED_FOR_REVIEW" | "REJECTED_FOR_REVIEW"
  ) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated.");
      return;
    }
    
    const toastId = toast.loading(
      `${action === "ACCEPTED_FOR_REVIEW" ? "Accepting" : "Rejecting"} assignment...`
    );
    try {
      await reviewerAcceptancy(paperId, session.user.id, action, () => {
        toast.success(
          `Assignment ${action === "ACCEPTED_FOR_REVIEW" ? "accepted" : "rejected"}!`, 
          { id: toastId }
        );
        loadReviewerPapers(pagination.page, pagination.limit);
      });
    } catch (error) {
      console.error(`Error ${action === "ACCEPTED_FOR_REVIEW" ? "accepting" : "rejecting"} assignment:`, error);
      toast.error(
        `Failed to ${action === "ACCEPTED_FOR_REVIEW" ? "accept" : "reject"} assignment.`, 
        { id: toastId }
      );
    }
  };

  const handleViewPaper = (paper: PaperWithRelations) => {
    setSelectedPaper(paper);
    setIsViewModalOpen(true);
  };

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadReviewerPapers();
    }
  }, [sessionStatus]);

  // Loading State
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-700">Loading allocated papers...</span>
      </div>
    );
  }

  // Access Control
  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in to view this page.
        </span>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: papers.length,
    pending: papers.filter(p => getUserReviewStatus(p) === "PENDING").length,
    accepted: papers.filter(p => getUserReviewStatus(p) === "ACCEPTED_FOR_REVIEW").length,
    completed: papers.filter(p => 
      ["ACCEPTED_FOR_PUBLICATION", "REJECTED_FOR_PUBLICATION"].includes(getUserReviewStatus(p))
    ).length,
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Allocated Papers
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage your paper assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => loadReviewerPapers(pagination.page, pagination.limit)}
              variant="outline"
              disabled={loading}
              className="shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Assigned</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-amber-700">Pending</CardDescription>
              <CardTitle className="text-2xl text-amber-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-green-700">Accepted</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.accepted}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-blue-700">Completed</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACCEPTED_FOR_REVIEW">Accepted</SelectItem>
                    <SelectItem value="REJECTED_FOR_REVIEW">Rejected</SelectItem>
                    <SelectItem value="ACCEPTED_FOR_PUBLICATION">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>
                Showing {filteredPapers.length} of {papers.length} papers
              </span>
              {(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Papers Display */}
            {filteredPapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-6 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No papers found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm || statusFilter !== "all"
                    ? "No papers match your current filters. Try adjusting your search."
                    : "You don't have any papers assigned for review at the moment."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPapers.map((paper) => {
                  const status = getUserReviewStatus(paper);
                  return (
                    <Card
                      key={paper.id}
                      className="group hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden"
                    >
                      <div className={`h-2 w-full ${
                        status === "PENDING" ? "bg-amber-400" :
                        status === "ACCEPTED_FOR_REVIEW" ? "bg-green-400" :
                        status === "REJECTED_FOR_REVIEW" ? "bg-red-400" :
                        "bg-blue-400"
                      }`} />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant={getStatusBadgeVariant(status)}>
                            {getStatusLabel(status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {paper.paperId}
                          </span>
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {paper.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="truncate">{paper.author?.name || "Unknown"}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(paper.submissionDate), { addSuffix: true })}</span>
                        </div>

                        {paper.keywords && paper.keywords.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {paper.keywords.slice(0, 3).map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {paper.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{paper.keywords.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {paper.abstract && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {paper.abstract}
                          </p>
                        )}
                      </CardContent>

                      <CardFooter className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPaper(paper)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleReviewerAcceptance(paper.id, "ACCEPTED_FOR_REVIEW")}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReviewerAcceptance(paper.id, "REJECTED_FOR_REVIEW")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {status === "ACCEPTED_FOR_REVIEW" && (
                          <Button
                            size="sm"
                            onClick={() => window.location.href = `/dashboard/reviewer/write?paperId=${paper.id}`}
                            className="flex-1"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredPapers.map((paper) => {
                  const status = getUserReviewStatus(paper);
                  return (
                    <Card
                      key={paper.id}
                      className="hover:shadow-lg transition-all duration-200 border-none shadow-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-1 h-full rounded-full ${
                            status === "PENDING" ? "bg-amber-400" :
                            status === "ACCEPTED_FOR_REVIEW" ? "bg-green-400" :
                            status === "REJECTED_FOR_REVIEW" ? "bg-red-400" :
                            "bg-blue-400"
                          }`} />

                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={getStatusBadgeVariant(status)}>
                                    {getStatusLabel(status)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ID: {paper.paperId}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-lg mb-1 hover:text-purple-600 transition-colors cursor-pointer">
                                  {paper.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {paper.author?.name || "Unknown"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(paper.submissionDate), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPaper(paper)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                
                                {status === "PENDING" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleReviewerAcceptance(paper.id, "ACCEPTED_FOR_REVIEW")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleReviewerAcceptance(paper.id, "REJECTED_FOR_REVIEW")}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}

                                {status === "ACCEPTED_FOR_REVIEW" && (
                                  <Button
                                    size="sm"
                                    onClick={() => window.location.href = `/dashboard/reviewer/write?paperId=${paper.id}`}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Write Review
                                  </Button>
                                )}
                              </div>
                            </div>

                            {paper.keywords && paper.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {paper.keywords.map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {paper.abstract && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {paper.abstract}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Paper Modal */}
        {selectedPaper && (
          <ViewPaperModal
            paperId={selectedPaper.paperId}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedPaper(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
