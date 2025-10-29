// Page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Eye,
  Calendar,
  MoreHorizontal,
  ArrowUpDown,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  UserCheck,
  Activity,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  Cell,
  Bar,
  PieChart as NewPie,
  BarChart as NewBarChart,
} from "recharts";
import toast from "react-hot-toast";

// Types
interface DashboardStats {
  totalAuthoredPapers?: number;
  papersInReview?: number;
  papersAccepted?: number;
  papersRejected?: number;
  totalAssignedReviews?: number;
  completedReviews?: number;
  pendingReviews?: number;
  papersToAllocate?: number;
  papersCompleted?: number;
  totalPapersManaged?: number;
  totalUsers?: number;
  totalPapers?: number;
  totalReviews?: number;
  averageRating?: number;
  totalResearchPapers?: number;
  totalReviewers?: number;
  averageOverallReviewRating?: number;
  papersByStatus?: Record<string, number>;
  usersByType?: Record<string, number>;
}

interface Paper {
  id: string;
  title: string;
  status: string;
  submissionDate: string;
  acceptedDate?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  reviews?: Array<{
    id: string;
    rating?: number;
    reviewerStatus: string;
    reviewer?: {
      name: string;
      email: string;
    };
  }>;
}

interface DashboardData {
  userStats: DashboardStats;
  overallStats: DashboardStats;
  papers: Paper[];
}

export default function Page() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  console.log("Dashboard page render - Session status:", status, "User:", session?.user?.email);

  const userType = session?.user?.variableUserType || session?.user?.userType;
  const userId = session?.user?.id;

  // Listen for role changes and refresh data
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      console.log("Role changed, refreshing dashboard data");
      // Force re-fetch by updating a key dependency
      if (session?.user) {
        setLoading(true);
        // The main useEffect will handle the refetch
      }
    };

    window.addEventListener("userRoleChanged", handleRoleChange as EventListener);
    return () => window.removeEventListener("userRoleChanged", handleRoleChange as EventListener);
  }, [session]);

  // Fetch dashboard data based on user role with memoization
  useEffect(() => {
    if (status === "loading" || !session?.user || !userId || !userType) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching dashboard data for user: ${userId}, role: ${userType}`);
        
        // Fetch stats and papers in parallel for better performance
        const [statsResponse, papersResponse] = await Promise.all([
          axios.get(`/api/stats?userId=${userId}&userType=${userType}`),
          (() => {
            if (userType === "AUTHOR") {
              return axios.get(`/api/paper?authorId=${userId}&page=1&limit=50`);
            } else if (userType === "REVIEWER") {
              return axios.get(`/api/paper/reviewer-papers?reviewerId=${userId}&page=1&limit=50`);
            } else if (userType === "EDITOR" || userType === "ADMIN") {
              return axios.get(`/api/paper?page=1&limit=50`);
            }
            return Promise.resolve({ data: { papers: [] } });
          })()
        ]);

        const statsData = statsResponse.data;
        const fetchedPapers = papersResponse?.data?.papers || papersResponse?.data?.data || [];

        setDashboardData({
          userStats: statsData.stats?.userSpecific || statsData.stats || {},
          overallStats: statsData.stats?.overall || {},
          papers: fetchedPapers,
        });
        setPapers(fetchedPapers);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, userType, status]); // Removed session dependency to prevent unnecessary re-fetches

  if (status === "loading" || loading) {
    return <DashboardSkeleton />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          Role: <Badge variant="secondary">{userType}</Badge>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCards userType={userType || "AUTHOR"} stats={dashboardData?.userStats || {}} />
      </div>

      <Separator />

      {/* Papers Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {getRoleBasedTableTitle(userType || "AUTHOR")}
          </h2>
          <p className="text-muted-foreground">
            {getRoleBasedTableDescription(userType || "AUTHOR")}
          </p>
        </div>
        
        <PapersTable papers={papers} userType={userType || "AUTHOR"} />
      </div>
    </div>
  );
}

// Stats Cards Component
function StatsCards({ userType, stats }: { userType: string; stats: DashboardStats }) {
  const getStatsForRole = () => {
    switch (userType) {
      case "AUTHOR":
        return [
          {
            title: "Total Papers",
            value: stats.totalAuthoredPapers || 0,
            description: "Papers you've authored",
            icon: FileText,
            chart: <TrendChart data={generateTrendData(stats.totalAuthoredPapers || 0)} />,
            color: "bg-blue-500",
          },
          {
            title: "In Review",
            value: stats.papersInReview || 0,
            description: "Papers under review",
            icon: Clock,
            chart: <PieChart data={[
              { name: "In Review", value: stats.papersInReview || 0 },
              { name: "Other", value: (stats.totalAuthoredPapers || 0) - (stats.papersInReview || 0) }
            ]} />,
            color: "bg-yellow-500",
          },
          {
            title: "Accepted",
            value: stats.papersAccepted || 0,
            description: "Papers accepted",
            icon: CheckCircle,
            chart: <BarChart data={generateAcceptanceData(stats)} />,
            color: "bg-green-500",
          },
        ];
      
      case "REVIEWER":
        return [
          {
            title: "Total Reviews",
            value: stats.totalAssignedReviews || 0,
            description: "Reviews assigned to you",
            icon: UserCheck,
            chart: <TrendChart data={generateTrendData(stats.totalAssignedReviews || 0)} />,
            color: "bg-purple-500",
          },
          {
            title: "Completed",
            value: stats.completedReviews || 0,
            description: "Reviews completed",
            icon: CheckCircle,
            chart: <PieChart data={[
              { name: "Completed", value: stats.completedReviews || 0 },
              { name: "Pending", value: stats.pendingReviews || 0 }
            ]} />,
            color: "bg-green-500",
          },
          {
            title: "Average Rating",
            value: Number((stats.averageRating || 0).toFixed(1)),
            description: "Your average rating",
            icon: Star,
            chart: <RatingChart rating={stats.averageRating || 0} />,
            color: "bg-orange-500",
          },
        ];
      
      case "EDITOR":
        return [
          {
            title: "To Allocate",
            value: stats.papersToAllocate || 0,
            description: "Papers awaiting allocation",
            icon: Activity,
            chart: <TrendChart data={generateTrendData(stats.papersToAllocate || 0)} />,
            color: "bg-red-500",
          },
          {
            title: "In Review",
            value: (stats.totalPapersManaged || 0) - (stats.papersCompleted || 0) - (stats.papersToAllocate || 0),
            description: "Papers in review",
            icon: Clock,
            chart: <PieChart data={[
              { name: "In Review", value: (stats.totalPapersManaged || 0) - (stats.papersCompleted || 0) - (stats.papersToAllocate || 0) },
              { name: "Completed", value: stats.papersCompleted || 0 }
            ]} />,
            color: "bg-yellow-500",
          },
          {
            title: "Completed",
            value: stats.papersCompleted || 0,
            description: "Papers completed",
            icon: CheckCircle,
            chart: <BarChart data={generateCompletionData(stats)} />,
            color: "bg-green-500",
          },
        ];
      
      case "ADMIN":
        return [
          {
            title: "Total Users",
            value: stats.totalUsers || 0,
            description: "Registered users",
            icon: Users,
            chart: <TrendChart data={generateTrendData(stats.totalUsers || 0)} />,
            color: "bg-indigo-500",
          },
          {
            title: "Total Papers",
            value: stats.totalResearchPapers || 0,
            description: "Research papers",
            icon: FileText,
            chart: <TrendChart data={generateTrendData(stats.totalResearchPapers || 0)} />,
            color: "bg-blue-500",
          },
          {
            title: "Avg Rating",
            value: Number((stats.averageOverallReviewRating || 0).toFixed(1)),
            description: "Overall review rating",
            icon: Star,
            chart: <RatingChart rating={stats.averageOverallReviewRating || 0} />,
            color: "bg-yellow-500",
          },
        ];
      
      default:
        return [];
    }
  };

  const statsCards = getStatsForRole();

  return (
    <>
      {statsCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.color} text-white`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            <div className="mt-4 h-[60px]">
              {stat.chart}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

// Chart Components
function TrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
}

function PieChart({ data }: { data: any[] }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <NewPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={20}
          outerRadius={40}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </NewPie>
    </ResponsiveContainer>
  );
}

function BarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <NewBarChart data={data}>
        <Bar dataKey="value" fill="#8884d8" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <Tooltip />
      </NewBarChart>
    </ResponsiveContainer>
  );
}

function RatingChart({ rating }: { rating: number }) {
  const data = [
    { name: "Rating", value: rating },
    { name: "Max", value: 5 - rating },
  ];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <NewPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={20}
          outerRadius={40}
          dataKey="value"
        >
          <Cell fill="#22c55e" />
          <Cell fill="#e5e7eb" />
        </Pie>
        <Tooltip formatter={(value, name) => name === "Rating" ? [value, "Rating"] : null} />
      </NewPie>
    </ResponsiveContainer>
  );
}

// Helper functions for generating chart data
function generateTrendData(value: number) {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(value * (0.7 + Math.random() * 0.6)),
  }));
}

function generateAcceptanceData(stats: DashboardStats) {
  return [
    { name: "Accepted", value: stats.papersAccepted || 0 },
    { name: "Rejected", value: stats.papersRejected || 0 },
    { name: "In Review", value: stats.papersInReview || 0 },
  ];
}

function generateCompletionData(stats: DashboardStats) {
  return [
    { name: "To Allocate", value: stats.papersToAllocate || 0 },
    { name: "In Review", value: (stats.totalPapersManaged || 0) - (stats.papersCompleted || 0) - (stats.papersToAllocate || 0) },
    { name: "Completed", value: stats.papersCompleted || 0 },
  ];
}

// Papers Table Component
function PapersTable({ papers, userType }: { papers: Paper[]; userType: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Paper>[] = [
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
        <div className="max-w-[300px] truncate font-medium">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusVariant(status)}>
            {status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "submissionDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("submissionDate"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    ...(userType === "REVIEWER" || userType === "EDITOR" || userType === "ADMIN"
      ? [
          {
            accessorKey: "author",
            header: "Author",
            cell: ({ row }: any) => {
              const author = row.getValue("author");
              return author ? (
                <div>
                  <div className="font-medium">{author.name}</div>
                  <div className="text-sm text-muted-foreground">{author.email}</div>
                </div>
              ) : (
                <div>—</div>
              );
            },
          },
        ]
      : []),
    ...(userType === "AUTHOR"
      ? [
          {
            accessorKey: "reviews",
            header: "Reviews",
            cell: ({ row }: any) => {
              const reviews = row.getValue("reviews") || [];
              return (
                <div className="text-sm">
                  {reviews.length > 0 ? `${reviews.length} review(s)` : "No reviews"}
                </div>
              );
            },
          },
        ]
      : []),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => window.open(`/paper/${row.original.id}`, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {userType === "REVIEWER" && (
              <DropdownMenuItem
                onClick={() => window.open(`/review/${row.original.id}`, "_blank")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Write Review
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search papers..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border bg-white">
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No papers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {papers.length} papers
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRoleBasedTableTitle(userType: string): string {
  switch (userType) {
    case "AUTHOR":
      return "My Papers";
    case "REVIEWER":
      return "Assigned Papers";
    case "EDITOR":
      return "Papers to Manage";
    case "ADMIN":
      return "All Papers";
    default:
      return "Papers";
  }
}

function getRoleBasedTableDescription(userType: string): string {
  switch (userType) {
    case "AUTHOR":
      return "Papers you have authored and submitted";
    case "REVIEWER":
      return "Papers assigned to you for review";
    case "EDITOR":
      return "Papers under your editorial management";
    case "ADMIN":
      return "All papers in the system";
    default:
      return "Papers list";
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "accepted":
    case "publish":
      return "default";
    case "rejected":
      return "destructive";
    case "on_review":
    case "reviewer_allocation":
      return "secondary";
    default:
      return "outline";
  }
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-[60px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}