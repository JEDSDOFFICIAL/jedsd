"use client";

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
  Edit,
  Upload,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ChartPieLabel } from "../charts/piechart";

interface DashboardStats {
  overall: {
    totalPapers: number;
    uploadedPapers: number;
    underReviewPapers: number;
    underEditPapers: number;
    publishedPapers: number;
    rejectedPapers: number;
    totalUsers: number;
    totalReviewers: number;
    totalEditors: number;
  };
  userSpecific: {
    authoredPapers?: number;
    authoredPublished?: number;
    assignedForReview?: number;
    reviewsCompleted?: number;
    assignedForEdit?: number;
    editsCompleted?: number;
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
        `/api/dashboard/stats?userId=${session?.user?.id}&userType=${session?.user?.userType}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
                <div className="text-2xl font-bold">{userStats.authoredPapers || 0}</div>
                <p className="text-xs text-muted-foreground">Total submitted</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.authoredPublished || 0}</div>
                <p className="text-xs text-muted-foreground">Papers published</p>
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
                <div className="text-2xl font-bold">{userStats.assignedForReview || 0}</div>
                <p className="text-xs text-muted-foreground">Papers to review</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.reviewsCompleted || 0}</div>
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
                <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.assignedForEdit || 0}</div>
                <p className="text-xs text-muted-foreground">Papers to edit</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.editsCompleted || 0}</div>
                <p className="text-xs text-muted-foreground">Edits done</p>
              </CardContent>
            </Card>
          </>
        );

      case "ADMIN":
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Submissions</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall.uploadedPapers}</div>
                <p className="text-xs text-muted-foreground">Awaiting assignment</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Process</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.overall.underReviewPapers + stats.overall.underEditPapers}
                </div>
                <p className="text-xs text-muted-foreground">Review + Edit</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall.publishedPapers}</div>
                <p className="text-xs text-muted-foreground">Total published</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overall.totalReviewers}R + {stats.overall.totalEditors}E
                </p>
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
              <CardTitle className="text-lg">Paper Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uploaded</span>
                  <Badge variant="outline">{stats.overall.uploadedPapers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Under Review</span>
                  <Badge variant="secondary">{stats.overall.underReviewPapers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Under Edit</span>
                  <Badge variant="secondary">{stats.overall.underEditPapers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Published</span>
                  <Badge variant="default">{stats.overall.publishedPapers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rejected</span>
                  <Badge variant="destructive">{stats.overall.rejectedPapers}</Badge>
                </div>
              </div>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Papers</span>
                  <span className="font-semibold">{stats.overall.totalPapers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Reviewers</span>
                  <span className="font-semibold">{stats.overall.totalReviewers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Editors</span>
                  <span className="font-semibold">{stats.overall.totalEditors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {stats.overall.totalPapers > 0 
                      ? Math.round((stats.overall.publishedPapers / stats.overall.totalPapers) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
