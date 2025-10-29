"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Calendar,
  BarChart3,
  Activity,
  Target,
  Award,
  BookOpen,
  UserCheck,
  Star,
  Zap,
} from "lucide-react";
import { PaperStatusChart } from "./PaperStatusChart";
import { MonthlySubmissionsChart } from "./MonthlySubmissionsChart";
import { ReviewProgressChart } from "./ReviewProgressChart";
import { UserTypeChart } from "./UserTypeChart";
import { UserActivityChart } from "./UserActivityChart";


interface AnalyticsData {
  papers: any[];
  reviews: any[];
  users: any[];
  userStats: any;
  overallStats: any;
}

interface AnalyticsCardsProps {
  data: AnalyticsData;
  loading?: boolean;
}

export function AnalyticsCards({ data, loading = false }: AnalyticsCardsProps) {
  const { data: session } = useSession();
  const userType = session?.user?.userType;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderUserAnalytics = () => {
    const userPapers = data.papers.filter(p => p.authorId === session?.user?.id) || [];
    const acceptedPapers = userPapers.filter(p => p.status === "ACCEPTED");
    const publishedPapers = userPapers.filter(p => p.status === "PUBLISH");
    const rejectedPapers = userPapers.filter(p => p.status === "REJECTED");
    
    return (
      <>
        {/* User Stats Cards */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">My Papers</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{userPapers.length}</div>
            <p className="text-xs text-blue-600">Total submitted</p>
            <div className="mt-4">
              <PaperStatusChart papers={userPapers} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {userPapers.length > 0 ? Math.round(((acceptedPapers.length + publishedPapers.length) / userPapers.length) * 100) : 0}%
            </div>
            <p className="text-xs text-green-600">Acceptance rate</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Accepted</span>
                <span className="font-medium">{acceptedPapers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Published</span>
                <span className="font-medium">{publishedPapers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Submission Trend</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {userPapers.filter(p => 
                new Date(p.submissionDate).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-purple-600">This month</p>
            <div className="mt-4">
              <MonthlySubmissionsChart papers={userPapers} />
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderReviewerAnalytics = () => {
    const reviewerReviews = data.reviews.filter(r => r.reviewerId === session?.user?.id) || [];
    const completedReviews = reviewerReviews.filter(r => 
      r.reviewerStatus === "ACCEPTED_FOR_PUBLICATION" || r.reviewerStatus === "REJECTED_FOR_PUBLICATION"
    );
    const pendingReviews = reviewerReviews.filter(r => r.reviewerStatus === "PENDING");
    
    return (
      <>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Review Progress</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{completedReviews.length}</div>
            <p className="text-xs text-orange-600">Completed reviews</p>
            <div className="mt-4">
              <ReviewProgressChart 
                completed={completedReviews.length} 
                pending={pendingReviews.length} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">
              {reviewerReviews.length > 0 
                ? (reviewerReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewerReviews.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-teal-600">Average score given</p>
            <div className="mt-4 text-center text-sm text-teal-700">
              {reviewerReviews.length} reviews completed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Review Speed</CardTitle>
            <Zap className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">
              {completedReviews.length > 0 ? '3.2' : '0'}
            </div>
            <p className="text-xs text-indigo-600">Avg days per review</p>
            <div className="mt-4 text-center text-sm text-indigo-700">
              {completedReviews.length} reviews processed
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderEditorAnalytics = () => {
    const papersToAllocate = data.papers.filter(p => p.status === "UPLOAD").length;
    const papersInReview = data.papers.filter(p => p.status === "ON_REVIEW").length;
    const papersCompleted = data.papers.filter(p => 
      p.status === "ACCEPTED" || p.status === "REJECTED" || p.status === "PUBLISH"
    ).length;
    
    return (
      <>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Papers Queue</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{papersToAllocate}</div>
            <p className="text-xs text-red-600">Awaiting allocation</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">In Review</span>
                <span className="font-medium">{papersInReview}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Completed</span>
                <span className="font-medium">{papersCompleted}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Review Status</CardTitle>
            <BookOpen className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{papersInReview}</div>
            <p className="text-xs text-yellow-600">Under review</p>
            <div className="mt-4">
              <PaperStatusChart papers={data.papers} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Efficiency</CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {data.papers.length > 0 ? Math.round((papersCompleted / data.papers.length) * 100) : 0}%
            </div>
            <p className="text-xs text-emerald-600">Completion rate</p>
            <div className="mt-4">
              <ReviewProgressChart 
                completed={papersCompleted} 
                pending={papersToAllocate + papersInReview} 
              />
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderAdminAnalytics = () => {
    const totalUsers = data.users.length;
    const totalPapers = data.papers.length;
    const totalReviews = data.reviews.length;
    const activeReviewers = data.users.filter(u => u.userType === "REVIEWER").length;
    
    return (
      <>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">System Overview</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalPapers}</div>
            <p className="text-xs text-slate-600">Total papers</p>
            <div className="mt-4">
              <PaperStatusChart papers={data.papers} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">User Distribution</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalUsers}</div>
            <p className="text-xs text-blue-600">Total users</p>
            <div className="mt-4">
              <UserTypeChart users={data.users} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Daily Activity</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {data.papers.filter(p => 
                new Date(p.submissionDate).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-orange-600">Today&apos;s submissions</p>
            <div className="mt-4">
              <UserActivityChart papers={data.papers} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-800">Review Health</CardTitle>
            <UserCheck className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-900">{totalReviews}</div>
            <p className="text-xs text-violet-600">Total reviews</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Active Reviewers</span>
                <span className="font-medium">{activeReviewers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Avg Reviews/Paper</span>
                <span className="font-medium">
                  {totalPapers > 0 ? (totalReviews / totalPapers).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userType === "AUTHOR" && renderUserAnalytics()}
      {userType === "REVIEWER" && renderReviewerAnalytics()}
      {userType === "EDITOR" && renderEditorAnalytics()}
      {userType === "ADMIN" && renderAdminAnalytics()}
    </div>
  );
}
