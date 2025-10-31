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
  Edit, 
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
  AlertTriangle
} from "lucide-react";
import { fetchReviewerPapers } from "@/lib/Frontend-actions";
import { PaperWithRelations } from "@/types/dataTypes";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";

interface ReviewerStats {
  totalAssigned: number;
  totalAccepted: number;
  totalRejected: number;
  pendingReviews: number;
  completedReviews: number;
  averageRating: number;
  averageReviewTime: number;
  onTimeSubmissions: number;
  recentActivity: number;
  expertiseAreas: string[];
}

export default function ReviewerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [papers, setPapers] = useState<PaperWithRelations[]>([]);
  const [stats, setStats] = useState<ReviewerStats>({
    totalAssigned: 0,
    totalAccepted: 0,
    totalRejected: 0,
    pendingReviews: 0,
    completedReviews: 0,
    averageRating: 0,
    averageReviewTime: 0,
    onTimeSubmissions: 0,
    recentActivity: 0,
    expertiseAreas: []
  });
  const [loading, setLoading] = useState(true);

  // Utility function to get user review status
  const getUserReviewStatus = (paper: PaperWithRelations) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    return userReview?.reviewerStatus || "PENDING";
  };

  // Utility function to check if review is submitted
  const hasSubmittedReview = (paper: PaperWithRelations) => {
    const status = getUserReviewStatus(paper);
    return status === "ACCEPTED_FOR_PUBLICATION" || status === "REJECTED_FOR_PUBLICATION";
  };

  // Calculate statistics from papers data
  const calculateStats = (papersData: PaperWithRelations[]): ReviewerStats => {
    const totalAssigned = papersData.length;
    let totalAccepted = 0;
    let totalRejected = 0;
    let pendingReviews = 0;
    let completedReviews = 0;
    let totalRating = 0;
    let ratingsCount = 0;

    papersData.forEach(paper => {
      const status = getUserReviewStatus(paper);
      const hasReview = hasSubmittedReview(paper);

      switch (status) {
        case "ACCEPTED_FOR_REVIEW":
          totalAccepted++;
          if (!hasReview) pendingReviews++;
          break;
        case "REJECTED_FOR_REVIEW":
          totalRejected++;
          break;
        case "ACCEPTED_FOR_PUBLICATION":
        case "REJECTED_FOR_PUBLICATION":
          totalAccepted++;
          completedReviews++;
          break;
      }

      // Calculate average rating
      if (paper.reviews && session?.user?.id) {
        const userReview = paper.reviews.find(r => r.reviewerId === session.user.id);
        if (userReview && userReview.rating) {
          totalRating += userReview.rating;
          ratingsCount++;
        }
      }
    });

    return {
      totalAssigned,
      totalAccepted,
      totalRejected,
      pendingReviews,
      completedReviews,
      averageRating: ratingsCount > 0 ? totalRating / ratingsCount : 0,
      averageReviewTime: 0, // Only show real data when available
      onTimeSubmissions: 0, // Only show real data when available
      recentActivity: completedReviews,
      expertiseAreas: ["nhi"]
    };
  };

  // Load reviewer data
  const loadReviewerData = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetchReviewerPapers(session.user.id, 1, 100); // Get all papers
      if (response && response.data) {
        setPapers(response.data);
        const calculatedStats = calculateStats(response.data);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error("Error loading reviewer data:", error);
      toast.error("Failed to load reviewer data");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadReviewerData();
    }
  }, [sessionStatus]);
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
  if (!session || !session.user || (session.user.userType === "AUTHOR" )) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in as a Reviewer to view this page.
        </span>
      </div>
    );
  }

  // Get recent papers for quick access
  const recentPendingPapers = papers
    .filter(p => getUserReviewStatus(p) === "ACCEPTED_FOR_REVIEW" && !hasSubmittedReview(p))
    .slice(0, 3);

  const recentCompletedPapers = papers
    .filter(p => hasSubmittedReview(p))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {session.user.name}!
                </h1>
                <p className="text-muted-foreground">Your reviewer dashboard at a glance</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadReviewerData}
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
          {/* Total Assigned */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-50">
                  Total Assigned
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalAssigned}</div>
              <p className="text-xs text-blue-100 mt-1">Papers allocated to you</p>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-50">
                  Pending Reviews
                </CardTitle>
                <Clock className="h-5 w-5 text-amber-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.pendingReviews}</div>
              <p className="text-xs text-amber-100 mt-1">Awaiting your feedback</p>
              {stats.pendingReviews > 0 && (
                <Link href="/dashboard/reviewer/write">
                  <Button size="sm" variant="secondary" className="mt-3 w-full">
                    Review Now
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Completed Reviews */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-50">
                  Completed
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.completedReviews}</div>
              <p className="text-xs text-green-100 mt-1">Reviews submitted</p>
              <div className="mt-3">
                <Progress 
                  value={stats.totalAssigned > 0 ? (stats.completedReviews / stats.totalAssigned) * 100 : 0} 
                  className="h-2 bg-green-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-50">
                  Avg Rating
                </CardTitle>
                <Star className="h-5 w-5 text-purple-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </div>
              <p className="text-xs text-purple-100 mt-1">Your review ratings</p>
              {stats.averageRating > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= Math.round(stats.averageRating)
                          ? "fill-yellow-300 text-yellow-300"
                          : "text-purple-200"
                      }`}
                    />
                  ))}
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
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Review Performance
                  </CardTitle>
                  <CardDescription>Your review activity breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Acceptance Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Accepted for Review
                  </span>
                  <span className="text-muted-foreground">
                    {stats.totalAccepted} / {stats.totalAssigned}
                  </span>
                </div>
                <Progress 
                  value={stats.totalAssigned > 0 ? (stats.totalAccepted / stats.totalAssigned) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Completion Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Completion Rate
                  </span>
                  <span className="text-muted-foreground">
                    {stats.completedReviews} / {stats.totalAccepted}
                  </span>
                </div>
                <Progress 
                  value={stats.totalAccepted > 0 ? (stats.completedReviews / stats.totalAccepted) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Rejected Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Rejected Assignments
                  </span>
                  <span className="text-muted-foreground">
                    {stats.totalRejected} / {stats.totalAssigned}
                  </span>
                </div>
                <Progress 
                  value={stats.totalAssigned > 0 ? (stats.totalRejected / stats.totalAssigned) * 100 : 0}
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
              <Link href="/dashboard/reviewer/allocated" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="h-4 w-4 mr-2" />
                  View Allocations
                  <Badge variant="secondary" className="ml-auto">
                    {stats.totalAssigned}
                  </Badge>
                </Button>
              </Link>
              
              <Link href="/dashboard/reviewer/write" className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                  disabled={stats.pendingReviews === 0}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Write Reviews
                  {stats.pendingReviews > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.pendingReviews}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button variant="outline" className="w-full justify-start" size="lg" disabled>
                <Award className="h-4 w-4 mr-2" />
                My Statistics
                <Badge variant="outline" className="ml-auto">Soon</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Papers Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Reviews */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Pending Reviews
                  </CardTitle>
                  <CardDescription>Papers awaiting your feedback</CardDescription>
                </div>
                <Link href="/dashboard/reviewer/write">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentPendingPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending reviews</p>
                  <p className="text-xs">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPendingPapers.map((paper) => (
                    <Link
                      key={paper.id}
                      href={`/dashboard/reviewer/write?paperId=${paper.id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {paper.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {paper.author?.name || "Unknown"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(paper.submissionDate), { addSuffix: true })}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Completed */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Recently Completed
                  </CardTitle>
                  <CardDescription>Your latest submitted reviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentCompletedPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No completed reviews yet</p>
                  <p className="text-xs">Start reviewing papers!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCompletedPapers.map((paper) => {
                    const userReview = paper.reviews?.find(r => r.reviewerId === session.user.id);
                    return (
                      <div
                        key={paper.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {paper.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reviewed {formatDistanceToNow(new Date(paper.submissionDate), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {userReview?.rating && (
                              <Badge variant="outline" className="gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {userReview.rating}
                              </Badge>
                            )}
                            <Badge 
                              variant={
                                getUserReviewStatus(paper) === "ACCEPTED_FOR_PUBLICATION" 
                                  ? "default" 
                                  : "destructive"
                              }
                            >
                              {getUserReviewStatus(paper) === "ACCEPTED_FOR_PUBLICATION" ? "Accepted" : "Rejected"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
