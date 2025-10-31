"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Star,
  BarChart3,
  FileCheck,
  AlertTriangle,
  Edit,
  Eye
} from "lucide-react";
import axios from "axios";
import { ResearchPaper } from "@prisma/client";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { DataTable } from "./mypaper/data-table";
import { createColumns } from "./mypaper/columns";
import { EditPaperModal } from "./mypaper/edit-paper-modal";
import { ViewPaperModal } from "@/components/view-paper-modal";

interface AuthorStats {
  totalPapers: number;
  papersInReview: number;
  papersAccepted: number;
  papersRejected: number;
  papersPublished: number;
  pendingAllocation: number;
  averageRating: number;
}

export default function AuthorDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [stats, setStats] = useState<AuthorStats>({
    totalPapers: 0,
    papersInReview: 0,
    papersAccepted: 0,
    papersRejected: 0,
    papersPublished: 0,
    pendingAllocation: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingPaperId, setViewingPaperId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Calculate statistics from papers data
  const calculateStats = (papersData: ResearchPaper[]): AuthorStats => {
    const totalPapers = papersData.length;
    let papersInReview = 0;
    let papersAccepted = 0;
    let papersRejected = 0;
    let papersPublished = 0;
    let pendingAllocation = 0;
    let totalRating = 0;
    let ratingsCount = 0;

    papersData.forEach(paper => {
      switch (paper.status) {
        case "ON_REVIEW":
          papersInReview++;
          break;
        case "ACCEPTED":
          papersAccepted++;
          break;
        case "REJECTED":
          papersRejected++;
          break;
        case "PUBLISH":
          papersPublished++;
          break;
        case "UPLOAD":
        case "REVIEWER_ALLOCATION":
          pendingAllocation++;
          break;
      }

      // Calculate average rating
      if (paper.rating) {
        totalRating += paper.rating;
        ratingsCount++;
      }
    });

    return {
      totalPapers,
      papersInReview,
      papersAccepted,
      papersRejected,
      papersPublished,
      pendingAllocation,
      averageRating: ratingsCount > 0 ? totalRating / ratingsCount : 0,
    };
  };

  // Load author data
  const loadAuthorData = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/paper?authorId=${session.user.id}`);
      const fetchedPapers = response.data.papers || [];
      setPapers(fetchedPapers);
      const calculatedStats = calculateStats(fetchedPapers);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Error loading author data:", error);
      toast.error("Failed to load your papers");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadAuthorData();
    }
  }, [sessionStatus]);

  const handleEditPaper = (paperId: string) => {
    setEditingPaperId(paperId);
    setIsEditModalOpen(true);
  };

  const handleViewPaper = (paperId: string) => {
    setViewingPaperId(paperId);
    setIsViewModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadAuthorData();
  };

  // Loading State
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-700">Loading dashboard...</span>
      </div>
    );
  }

  // Access Control
  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in as an Author to view this page.
        </span>
      </div>
    );
  }

  // Get recent papers for quick access
  const recentInReviewPapers = papers
    .filter(p => p.status === "ON_REVIEW")
    .slice(0, 3);

  const recentPublishedPapers = papers
    .filter(p => p.status === "PUBLISH")
    .slice(0, 3);

  const columns = createColumns({ onEditPaper: handleEditPaper, onViewPaper: handleViewPaper });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {session.user.name}!
                </h1>
                <p className="text-muted-foreground">Your author dashboard at a glance</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/author/upload">
              <Button className="shadow-sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Paper
              </Button>
            </Link>
            <Button
              onClick={loadAuthorData}
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Papers */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-50">
                  Total Papers
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalPapers}</div>
              <p className="text-xs text-blue-100 mt-1">All submitted papers</p>
            </CardContent>
          </Card>

          {/* In Review */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-50">
                  Under Review
                </CardTitle>
                <Clock className="h-5 w-5 text-amber-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.papersInReview}</div>
              <p className="text-xs text-amber-100 mt-1">Currently being reviewed</p>
            </CardContent>
          </Card>

          {/* Accepted */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-50">
                  Accepted
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.papersAccepted}</div>
              <p className="text-xs text-green-100 mt-1">Papers accepted</p>
              <div className="mt-3">
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.papersAccepted / stats.totalPapers) * 100 : 0} 
                  className="h-2 bg-green-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Published */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-50">
                  Published
                </CardTitle>
                <Award className="h-5 w-5 text-purple-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.papersPublished}</div>
              <p className="text-xs text-purple-100 mt-1">Papers published</p>
              {stats.averageRating > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                  <span className="text-xs text-purple-100">
                    Avg: {stats.averageRating.toFixed(1)}/10
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <Card className="lg:col-span-2 shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Submission Overview
                  </CardTitle>
                  <CardDescription>Your paper status breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending Allocation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    Pending Allocation
                  </span>
                  <span className="text-muted-foreground">
                    {stats.pendingAllocation} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.pendingAllocation / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Under Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Under Review
                  </span>
                  <span className="text-muted-foreground">
                    {stats.papersInReview} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.papersInReview / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Accepted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Accepted
                  </span>
                  <span className="text-muted-foreground">
                    {stats.papersAccepted} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.papersAccepted / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Rejected */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Rejected
                  </span>
                  <span className="text-muted-foreground">
                    {stats.papersRejected} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.papersRejected / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/author/upload" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Paper
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                disabled={papers.length === 0}
                onClick={() => {
                  document.getElementById('my-papers-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                View All Papers
                <Badge variant="secondary" className="ml-auto">
                  {stats.totalPapers}
                </Badge>
              </Button>

              <Button variant="outline" className="w-full justify-start" size="lg" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                My Statistics
                <Badge variant="outline" className="ml-auto">Soon</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Papers Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Papers Under Review */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Under Review
                  </CardTitle>
                  <CardDescription>Papers currently being reviewed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentInReviewPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No papers under review</p>
                  <p className="text-xs">Submit a new paper to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInReviewPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleViewPaper(paper.paperId)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {paper.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {formatDistanceToNow(new Date(paper.submissionDate), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          <Clock className="h-3 w-3 mr-1" />
                          Review
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Published Papers */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Published Papers
                  </CardTitle>
                  <CardDescription>Your recently published work</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentPublishedPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No published papers yet</p>
                  <p className="text-xs">Keep submitting quality work!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPublishedPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleViewPaper(paper.paperId)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {paper.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Published {paper.acceptedDate && formatDistanceToNow(new Date(paper.acceptedDate), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {paper.rating && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {paper.rating}
                            </Badge>
                          )}
                          <Badge variant="default">
                            Published
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Papers Section - Full Data Table */}
        <div id="my-papers-section" className="space-y-4">
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    My Papers
                  </CardTitle>
                  <CardDescription>
                    View, edit, and manage all your submitted manuscripts
                  </CardDescription>
                </div>
                <Link href="/dashboard/author/upload">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Paper
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {papers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No papers submitted yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven&apos;t submitted any manuscripts yet. Start by uploading your first paper.
                  </p>
                  <Link href="/dashboard/author/upload">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Paper
                    </Button>
                  </Link>
                </div>
              ) : (
                <DataTable columns={columns} data={papers} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Paper Modal */}
      <EditPaperModal
        paperId={editingPaperId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPaperId(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* View Paper Modal */}
      <ViewPaperModal
        paperId={viewingPaperId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingPaperId(null);
        }}
      />
    </div>
  );
}
