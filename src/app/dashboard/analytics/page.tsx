"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  Users,
  FileText,
  Clock,
  Target
} from 'lucide-react';
import { AnalyticsCards } from '@/components/analytics/AnalyticsCards';
import { PaperStatusChart } from '@/components/analytics/PaperStatusChart';
import { UserActivityChart } from '@/components/analytics/UserActivityChart';
import { UserTypeChart } from '@/components/analytics/UserTypeChart';
import { MonthlySubmissionsChart } from '@/components/analytics/MonthlySubmissionsChart';
import { ReviewProgressChart } from '@/components/analytics/ReviewProgressChart';
import toast from 'react-hot-toast';

interface AnalyticsData {
  papers: any[];
  reviews: any[];
  users: any[];
  userStats: any;
  overallStats: any;
  userType: string;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const result = await response.json();
        setAnalyticsData(result.data);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAnalyticsData();
    }
  }, [session]);

  const getRoleDisplayName = (userType: string) => {
    switch (userType) {
      case 'USER': return 'Author';
      case 'REVIEWER': return 'Reviewer';
      case 'EDITOR': return 'Editor';
      case 'ADMIN': return 'Administrator';
      default: return userType;
    }
  };

  const renderRecentActivity = () => {
    if (!analyticsData?.overallStats?.recentActivity) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.overallStats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  {activity.type === 'paper_submission' ? (
                    <FileText className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Users className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-48">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {activity.type === 'paper_submission' ? activity.author : activity.reviewer}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(activity.date).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSystemOverview = () => {
    if (!analyticsData?.overallStats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {analyticsData.overallStats.totalPapers}
            </div>
            <p className="text-xs text-blue-600">
              +{analyticsData.overallStats.monthlySubmissions?.[5]?.submissions || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {analyticsData.overallStats.totalUsers}
            </div>
            <p className="text-xs text-green-600">Across all roles</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Reviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {analyticsData.overallStats.totalReviews}
            </div>
            <p className="text-xs text-purple-600">
              {analyticsData.overallStats.averageReviewsPerPaper.toFixed(1)} avg per paper
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {analyticsData.overallStats.papersByStatus?.PUBLISH || 0}
            </div>
            <p className="text-xs text-orange-600">Papers published</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <AnalyticsCards data={{ papers: [], reviews: [], users: [], userStats: {}, overallStats: {} }} loading={true} />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No analytics data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-gray-600">
            Dashboard for {getRoleDisplayName(analyticsData.userType)}
          </p>
        </div>
        <Button onClick={fetchAnalyticsData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCards data={analyticsData} />
          
          {(analyticsData.userType === 'ADMIN' || analyticsData.userType === 'EDITOR') && (
            <>
              {renderSystemOverview()}
              {renderRecentActivity()}
            </>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paper Status Distribution</CardTitle>
                <CardDescription>Current status of all papers in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PaperStatusChart papers={analyticsData.papers} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Submissions</CardTitle>
                <CardDescription>Paper submission trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <MonthlySubmissionsChart papers={analyticsData.papers} />
                </div>
              </CardContent>
            </Card>

            {analyticsData.userType === 'ADMIN' && (
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Users by role in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <UserTypeChart users={analyticsData.users} />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Top Reviewers</CardTitle>
                <CardDescription>Most active reviewers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.overallStats.topReviewers?.slice(0, 5).map((reviewer: any, index: number) => (
                    <div key={reviewer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{reviewer.name}</p>
                          <p className="text-sm text-gray-500">{reviewer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{reviewer.count} reviews</p>
                        <p className="text-sm text-gray-500">
                          {reviewer.averageRating.toFixed(1)} avg rating
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Submission Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <MonthlySubmissionsChart papers={analyticsData.papers} />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Monthly paper submission trends show the system usage patterns
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Review Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ReviewProgressChart 
                    completed={analyticsData.overallStats.reviewsByStatus?.ACCEPTED_FOR_PUBLICATION || 0}
                    pending={analyticsData.overallStats.reviewsByStatus?.PENDING || 0}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Current review completion status across all papers
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.overallStats.averageReviewsPerPaper.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Reviews per Paper</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((analyticsData.overallStats.papersByStatus?.PUBLISH || 0) / analyticsData.overallStats.totalPapers * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Publication Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.overallStats.papersByStatus?.ON_REVIEW || 0}
                  </div>
                  <div className="text-sm text-gray-600">In Review</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.overallStats.papersByStatus?.UPLOAD || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pending Assignment</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
