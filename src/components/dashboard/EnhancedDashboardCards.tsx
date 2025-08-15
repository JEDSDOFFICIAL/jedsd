// "use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
} from "lucide-react";
import { ChartPieLabel } from "../charts/piechart"; // Assuming this component exists

interface DashboardStats {
  overall: {
    totalUsers: number;
    totalResearchPapers: number;
    totalReviews: number;
    totalReviewers: number;
    papersByStatus: {
      UPLOAD: number;
      ON_REVIEW: number;
      ACCEPTED: number;
      REJECTED: number;
      PUBLISH: number;
    };
    averageOverallReviewRating: number;
  };
  userSpecific: {
    totalAuthoredPapers?: number;
    papersInReview?: number;
    papersAccepted?: number;
    papersRejected?: number;
    papersPublished?: number;
    totalAssignedReviews?: number;
    reviewsSubmitted?: number;
    reviewsPending?: number;
    averageRatingGiven?: number;
    // EDITOR specific properties
    papersToAllocate?: number;
    papersCompleted?: number;
    totalPapersManaged?: number;
  };
}

export function EnhancedDashboardCards() {
  const { data: session } = useSession();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stats?userId=${session?.user?.id}&userType=${session?.user?.userType}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserSpecificCards = () => {
    if (!stats || !session?.user) return null;

    const userType = session.user.userType;
    const userStats = stats.userSpecific;

    switch (userType) {
      case "USER":
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Papers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats.totalAuthoredPapers || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats.papersInReview || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently under review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userStats.papersAccepted || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers accepted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Upload className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.papersPublished || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers published
                </p>
              </CardContent>
            </Card>
          </>
        );

      case "REVIEWER":
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats.totalAssignedReviews || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers to review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats.reviewsSubmitted || 0}
                </div>
                <p className="text-xs text-muted-foreground">Reviews done</p>
              </CardContent>
            </Card>
          </>
        );

      case "EDITOR":
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">To Allocate</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.papersToAllocate || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers awaiting reviewer allocation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.papersInReview || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers currently under review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userStats.papersCompleted || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Managed</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.totalPapersManaged || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All papers in system
                </p>
              </CardContent>
            </Card>
          </>
        );

      case "ADMIN":
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Submissions
                </CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.overall?.papersByStatus?.UPLOAD || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting assignment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Under Review
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.overall?.papersByStatus?.ON_REVIEW || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Papers in review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.overall?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.overall?.papersByStatus?.PUBLISH || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total published</p>
              </CardContent>
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User-specific cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getUserSpecificCards()}
      </div>

      {/* System overview for admin */}
      {session?.user?.userType === "ADMIN" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Paper Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uploaded</span>
                  <Badge variant="outline">
                    {stats.overall.papersByStatus.UPLOAD}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Under Review</span>
                  <Badge variant="secondary">
                    {stats.overall.papersByStatus.ON_REVIEW}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accepted</span>
                  <Badge variant="default">
                    {stats.overall.papersByStatus.ACCEPTED}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Published</span>
                  <Badge variant="default">
                    {stats.overall.papersByStatus.PUBLISH}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rejected</span>
                  <Badge variant="destructive">
                    {stats.overall.papersByStatus.REJECTED}
                  </Badge>
                </div>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <a href="/dashboard/workflow">Manage Workflow</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/userlist">Manage Users</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/paperworkadmin">Review Papers</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Papers</span>
                  <span className="font-semibold">
                    {stats.overall.totalResearchPapers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Reviewers</span>
                  <span className="font-semibold">
                    {stats.overall.totalReviewers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Reviews</span>
                  <span className="font-semibold">
                    {stats.overall.totalReviews}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {stats.overall.totalResearchPapers > 0
                      ? Math.round(
                          (stats.overall.papersByStatus.PUBLISH /
                            stats.overall.totalResearchPapers) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
