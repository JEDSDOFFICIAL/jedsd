"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Star,
  Calendar,
  Target
} from "lucide-react";

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

interface ReviewerAnalyticsCardsProps {
  stats: ReviewerStats;
  loading?: boolean;
}

export function ReviewerAnalyticsCards({ stats, loading = false }: ReviewerAnalyticsCardsProps) {
  const acceptanceRate = stats.totalAssigned > 0 ? (stats.totalAccepted / stats.totalAssigned) * 100 : 0;
  const completionRate = stats.totalAccepted > 0 ? (stats.completedReviews / stats.totalAccepted) * 100 : 0;
  const onTimeRate = stats.completedReviews > 0 ? (stats.onTimeSubmissions / stats.completedReviews) * 100 : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assigned */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssigned}</div>
            <p className="text-xs text-muted-foreground">
              Papers allocated to you
            </p>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        {/* Completed Reviews */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedReviews}</div>
            <p className="text-xs text-muted-foreground">
              Reviews submitted
            </p>
          </CardContent>
        </Card>

        {/* Average Rating Given - Only show if there are ratings */}
        {stats.averageRating > 0 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating Given</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 5.0 stars
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics - Only show if we have meaningful data */}
      {(stats.totalAccepted > 0 || stats.completedReviews > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Acceptance Rate - Only show if there are assignments */}
          {stats.totalAssigned > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Acceptance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{acceptanceRate.toFixed(1)}%</span>
                    <Badge variant={acceptanceRate >= 70 ? "default" : acceptanceRate >= 50 ? "secondary" : "destructive"}>
                      {acceptanceRate >= 70 ? "High" : acceptanceRate >= 50 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                  <Progress value={acceptanceRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAccepted} accepted of {stats.totalAssigned} assigned
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Rate - Only show if there are accepted papers */}
          {stats.totalAccepted > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{completionRate.toFixed(1)}%</span>
                    <Badge variant={completionRate >= 90 ? "default" : completionRate >= 70 ? "secondary" : "destructive"}>
                      {completionRate >= 90 ? "Excellent" : completionRate >= 70 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {stats.completedReviews} completed of {stats.totalAccepted} accepted
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Additional Info - Only show if we have meaningful data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Review Performance - Only show if there are completed reviews */}
        {stats.completedReviews > 0 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Review Activity</CardTitle>
              <CardDescription>Your recent review performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recent Activity</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.recentActivity} reviews completed
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      {stats.pendingReviews > 0 
                        ? `${stats.pendingReviews} review${stats.pendingReviews > 1 ? 's' : ''} pending`
                        : "All reviews up to date"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expertise Areas - Only show if available */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expertise Areas</CardTitle>
            <CardDescription>Your areas of research interest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.expertiseAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.expertiseAreas.slice(0, 6).map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {stats.expertiseAreas.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{stats.expertiseAreas.length - 6} more
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No expertise areas specified
                </p>
              )}
              <div className="pt-2 text-xs text-muted-foreground">
                <span>Papers are assigned based on your expertise</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}