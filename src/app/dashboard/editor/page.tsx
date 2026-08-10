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
  CheckCheck, 
  Award, 
  ArrowRight, 
  Users, 
  UserCheck, 
  FileSignature, 
  LayoutDashboard,
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  FileCheck,
  Edit3,
  Eye,
  MoreHorizontal,
  Star,
  ArrowUpDown,
  Search,
  ChevronDown,
  Filter,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { ResearchPaper } from "@prisma/client";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface EditorStats {
  totalPapers: number;
  newSubmissions: number;
  papersInReview: number;
  readyForDecision: number;
  papersPublished: number;
  pendingAllocation: number;
  totalReviewers: number;
  activeReviewers: number;
}

interface Paper {
  id: string;
  paperId: string;
  title: string;
  status: string;
  submissionDate: string;
  author?: {
    name: string;
    email: string;
  };
}

interface PaperWithAuthor extends ResearchPaper {
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EditorPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [stats, setStats] = useState<EditorStats>({
    totalPapers: 0,
    newSubmissions: 0,
    papersInReview: 0,
    readyForDecision: 0,
    papersPublished: 0,
    pendingAllocation: 0,
    totalReviewers: 0,
    activeReviewers: 0,
  });
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [allPapers, setAllPapers] = useState<PaperWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const editorActions = [
    {
      title: "New Papers",
      description: "Review recently submitted manuscripts requiring editorial action",
      icon: FileText,
      href: "/dashboard/editor/new-papers",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      count: stats.newSubmissions,
    },
    {
      title: "Allocated Papers",
      description: "Papers with allocated reviewers - view reviews and contact authors",
      icon: CheckCheck,
      href: "/dashboard/editor/allocated-papers",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      count: stats.papersInReview,
    },
    {
      title: "Final Decision",
      description: "Accept, reject, update, or publish papers ready for final decision",
      icon: Award,
      href: "/dashboard/editor/final-decision",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      count: stats.readyForDecision,
    },
    {
      title: "Reviewer Management",
      description: "Manage and assign reviewers to papers",
      icon: Users,
      href: "/dashboard/editor/reviewers",
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
      count: stats.totalReviewers,
    },
    {
      title: "Read Reviews",
      description: "Read and analyze submitted reviews",
      icon: FileSignature,
      href: "/dashboard/editor/reviews",
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600",
    },
    {
      title: "Author Contact",
      description: "Communicate with paper authors",
      icon: UserCheck,
      href: "/dashboard/editor/authors",
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600",
    },
    {
      title: "Paper Actions",
      description: "Perform various actions on papers",
      icon: LayoutDashboard,
      href: "/dashboard/editor/paper-action",
      color: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-600",
    },
  ];

  // Calculate statistics from papers data
  const calculateStats = (papersData: Paper[]): EditorStats => {
    const totalPapers = papersData.length;
    let newSubmissions = 0;
    let papersInReview = 0;
    let readyForDecision = 0;
    let papersPublished = 0;
    let pendingAllocation = 0;

    papersData.forEach(paper => {
      switch (paper.status) {
        case "UPLOAD":
          newSubmissions++;
          break;
        case "REVIEWER_ALLOCATION":
          pendingAllocation++;
          break;
        case "ON_REVIEW":
          papersInReview++;
          break;
        case "EDITOR_DECISION":
          readyForDecision++;
          break;
        case "PUBLISH":
          papersPublished++;
          break;
      }
    });

    return {
      totalPapers,
      newSubmissions,
      papersInReview,
      readyForDecision,
      papersPublished,
      pendingAllocation,
      totalReviewers: 0, // Will be fetched separately if needed
      activeReviewers: 0,
    };
  };

  // Load editor data
  const loadEditorData = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/paper?page=1&limit=1000`);
      const fetchedPapers = response.data.papers || [];
      setRecentPapers(fetchedPapers.slice(0, 10));
      setAllPapers(fetchedPapers);
      const calculatedStats = calculateStats(fetchedPapers);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Error loading editor data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadEditorData();
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
  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in as an Editor to view this page.
        </span>
      </div>
    );
  }

  const newPapers = recentPapers.filter(p => p.status === "UPLOAD").slice(0, 3);
  const pendingDecision = recentPapers.filter(p => p.status === "EDITOR_DECISION").slice(0, 3);

  // Define columns for the papers table
  const columns: ColumnDef<PaperWithAuthor>[] = [
    {
      accessorKey: "paperId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <FileText className="mr-2 h-4 w-4" />
            Paper ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const paperId = row.getValue("paperId") as string;
        return (
          <div className="text-sm font-mono">
            {paperId}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const paper = row.original;
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">{paper.title}</div>
            <div className="text-sm text-muted-foreground truncate mt-1">
              {paper.abstract}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => {
        const author = row.getValue("author") as { name: string; email: string } | undefined;
        return author ? (
          <div>
            <div className="font-medium text-sm">{author.name}</div>
            <div className="text-xs text-muted-foreground">{author.email}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Unknown</div>
        );
      },
    },
    {
      accessorKey: "keywords",
      header: "Keywords",
      cell: ({ row }) => {
        const keywords = row.getValue("keywords") as string[];
        return (
          <div className="max-w-[200px]">
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 2).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {keywords.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{keywords.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        const getStatusColor = (status: string) => {
          switch (status) {
            case "UPLOAD":
              return "bg-blue-100 text-blue-800";
            case "REVIEWER_ALLOCATION":
              return "bg-yellow-100 text-yellow-800";
            case "ON_REVIEW":
              return "bg-orange-100 text-orange-800";
            case "EDITOR_DECISION":
              return "bg-purple-100 text-purple-800";
            case "ACCEPTED":
              return "bg-green-100 text-green-800";
            case "REJECTED":
              return "bg-red-100 text-red-800";
            case "PUBLISH":
              return "bg-emerald-100 text-emerald-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };

        const getStatusLabel = (status: string) => {
          switch (status) {
            case "UPLOAD":
              return "New";
            case "REVIEWER_ALLOCATION":
              return "Allocating";
            case "ON_REVIEW":
              return "Reviewing";
            case "EDITOR_DECISION":
              return "Decision";
            case "ACCEPTED":
              return "Accepted";
            case "REJECTED":
              return "Rejected";
            case "PUBLISH":
              return "Published";
            default:
              return status;
          }
        };

        return (
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "submissionDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <Clock className="mr-2 h-4 w-4" />
            Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("submissionDate") as Date;
        return (
          <div className="text-sm">
            {format(new Date(date), "MMM dd, yyyy")}
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <Star className="mr-2 h-4 w-4" />
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number | null;
        return (
          <div className="text-sm">
            {rating ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{rating}/10</span>
              </div>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const paper = row.original;
        const pocEmail = typeof paper.pointOfContact === 'object' && paper.pointOfContact 
          ? (paper.pointOfContact as any).email 
          : '';

        const handleCopyEmail = () => {
          if (pocEmail) {
            navigator.clipboard.writeText(pocEmail);
            toast.success(`Email copied: ${pocEmail}`);
          } else {
            toast.error("No email available");
          }
        };

        const handleDownloadPaper = () => {
          if (paper.filePath) {
            window.open(paper.filePath, '_blank');
            toast.success("Opening paper file...");
          } else {
            toast.error("Paper file not available");
          }
        };

        const handleDownloadCoverLetter = () => {
          if (paper.coverLetterPath) {
            window.open(paper.coverLetterPath, '_blank');
            toast.success("Opening cover letter...");
          } else {
            toast.error("Cover letter not available");
          }
        };

        const handleDownloadCorresponding = () => {
          if (paper.correspondingFile) {
            window.open(paper.correspondingFile, '_blank');
            toast.success("Opening corresponding file...");
          } else {
            toast.error("Corresponding file not available");
          }
        };
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Paper Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* View Paper */}
              <DropdownMenuItem asChild>
                <Link href={`/paper/${paper.paperId}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Paper Details
                </Link>
              </DropdownMenuItem>

              {/* Download Paper */}
              <DropdownMenuItem onClick={handleDownloadPaper}>
                <FileText className="mr-2 h-4 w-4" />
                View Paper File
              </DropdownMenuItem>

              {/* Download Cover Letter */}
              {paper.coverLetterPath && (
                <DropdownMenuItem onClick={handleDownloadCoverLetter}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Cover Letter
                </DropdownMenuItem>
              )}

              {/* Download Corresponding File */}
              {paper.correspondingFile && (
                <DropdownMenuItem onClick={handleDownloadCorresponding}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Corresponding File
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Editorial Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* View Reviews */}
              <DropdownMenuItem asChild>
                <Link href={`dashboard/editor/reviews/${paper.paperId}`}>
                  <FileSignature className="mr-2 h-4 w-4" />
                  View Reviews
                </Link>
              </DropdownMenuItem>

              {/* Give Rating */}
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/editor/paper-action?paperId=${paper.paperId}&action=rate`}>
                  <Star className="mr-2 h-4 w-4" />
                  Give Rating
                </Link>
              </DropdownMenuItem>

              {/* Edit Paper */}
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/editor/paper-action?paperId=${paper.paperId}&action=edit`}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Paper
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Contact</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Copy POC Email */}
              <DropdownMenuItem onClick={handleCopyEmail}>
                <UserCheck className="mr-2 h-4 w-4" />
                Copy POC Email
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Status-specific actions */}
              {paper.status === "UPLOAD" && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/editor/new-papers">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Review & Allocate
                  </Link>
                </DropdownMenuItem>
              )}
              
              {paper.status === "REVIEWER_ALLOCATION" && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/editor/new-papers">
                    <Users className="mr-2 h-4 w-4" />
                    Allocate Reviewers
                  </Link>
                </DropdownMenuItem>
              )}
              
              {paper.status === "EDITOR_DECISION" && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/editor/final-decision">
                    <Award className="mr-2 h-4 w-4" />
                    Make Decision
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen px-3 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome back, {session.user.name}!
                </h1>
                <p className="text-muted-foreground">Your editorial dashboard at a glance</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadEditorData}
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
              <p className="text-xs text-blue-100 mt-1">Under your management</p>
            </CardContent>
          </Card>

          {/* New Submissions */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-50">
                  New Submissions
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-amber-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.newSubmissions}</div>
              <p className="text-xs text-amber-100 mt-1">Awaiting initial review</p>
              {stats.newSubmissions > 0 && (
                <Link href="/dashboard/editor/new-papers">
                  <Button size="sm" variant="secondary" className="mt-3 w-full">
                    Review Now
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Under Review */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-50">
                  Under Review
                </CardTitle>
                <Activity className="h-5 w-5 text-green-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.papersInReview}</div>
              <p className="text-xs text-green-100 mt-1">Currently being reviewed</p>
              <div className="mt-3">
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.papersInReview / stats.totalPapers) * 100 : 0} 
                  className="h-2 bg-green-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ready for Decision */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-pink-600">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-50">
                  Final Decision
                </CardTitle>
                <Award className="h-5 w-5 text-purple-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.readyForDecision}</div>
              <p className="text-xs text-purple-100 mt-1">Ready for decision</p>
              {stats.readyForDecision > 0 && (
                <Link href="/dashboard/editor/final-decision">
                  <Button size="sm" variant="secondary" className="mt-3 w-full">
                    Make Decision
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflow Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <Card className="lg:col-span-2 shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Editorial Workflow
                  </CardTitle>
                  <CardDescription>Paper status breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Submissions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    New Submissions
                  </span>
                  <span className="text-muted-foreground">
                    {stats.newSubmissions} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.newSubmissions / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>

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
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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

              {/* Ready for Decision */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Ready for Decision
                  </span>
                  <span className="text-muted-foreground">
                    {stats.readyForDecision} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.readyForDecision / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>

              {/* Published */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Published
                  </span>
                  <span className="text-muted-foreground">
                    {stats.papersPublished} / {stats.totalPapers}
                  </span>
                </div>
                <Progress 
                  value={stats.totalPapers > 0 ? (stats.papersPublished / stats.totalPapers) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common editorial tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/editor/new-papers" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="h-4 w-4 mr-2" />
                  New Papers
                  {stats.newSubmissions > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.newSubmissions}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Link href="/dashboard/editor/final-decision" className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="lg"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Final Decisions
                  {stats.readyForDecision > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {stats.readyForDecision}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/dashboard/editor/reviewers" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="h-4 w-4 mr-2" />
                  Reviewers
                </Button>
              </Link>

              <Link href="/dashboard/editor/reviews" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileSignature className="h-4 w-4 mr-2" />
                  Read Reviews
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Papers Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Submissions */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    New Submissions
                  </CardTitle>
                  <CardDescription>Recently submitted papers</CardDescription>
                </div>
                <Link href="/dashboard/editor/new-papers">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {newPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new submissions</p>
                  <p className="text-xs">All papers have been reviewed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newPapers.map((paper) => (
                    <Link
                      key={paper.id}
                      href={`/dashboard/editor/new-papers`}
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

          {/* Pending Decisions */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Pending Decisions
                  </CardTitle>
                  <CardDescription>Papers ready for your decision</CardDescription>
                </div>
                <Link href="/dashboard/editor/final-decision">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingDecision.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending decisions</p>
                  <p className="text-xs">All papers are in other stages</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDecision.map((paper) => (
                    <Link
                      key={paper.id}
                      href={`/dashboard/editor/final-decision`}
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
                          <Badge variant="default" className="shrink-0">
                            <Edit3 className="h-3 w-3 mr-1" />
                            Decision
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor Actions Grid */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Editorial Tools</CardTitle>
            <CardDescription>
              Access all editorial functions and management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editorActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className={`${action.color} hover:shadow-md transition-all cursor-pointer h-full`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-white`}>
                            <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                          </div>
                          <CardTitle className="text-base">{action.title}</CardTitle>
                        </div>
                        {action.count !== undefined && action.count > 0 && (
                          <Badge variant="secondary">{action.count}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs leading-relaxed">
                        {action.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Papers Table */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  All Papers
                </CardTitle>
                <CardDescription>
                  View, search, filter, and manage all papers in the system
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {allPapers.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PapersDataTable columns={columns} data={allPapers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// DataTable Component
function PapersDataTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const statusOptions = [
    { value: "UPLOAD", label: "New" },
    { value: "REVIEWER_ALLOCATION", label: "Allocating" },
    { value: "ON_REVIEW", label: "Reviewing" },
    { value: "EDITOR_DECISION", label: "Decision" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "PUBLISH", label: "Published" },
  ];

  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search papers..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8"
            />
          </div>
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string[])?.join(",") || ""}
            onValueChange={(value) => {
              const statusColumn = table.getColumn("status");
              if (value === "all") {
                statusColumn?.setFilterValue(undefined);
              } else {
                statusColumn?.setFilterValue(value ? [value] : undefined);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                setGlobalFilter("");
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 bg-muted/30 px-2 rounded-t-lg border-x border-t">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page:</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[80px] bg-background">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} filtered results
          {table.getFilteredRowModel().rows.length !== table.getCoreRowModel().rows.length && 
            ` (${table.getCoreRowModel().rows.length} total)`
          }
        </div>
      </div>

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
                  No papers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t bg-muted/50 px-4">
        <div className="text-sm text-muted-foreground">
          Showing page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} ({table.getFilteredRowModel().rows.length} total papers)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-9 px-3"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 px-3"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1 px-2">
            <span className="text-sm font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">
              {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 px-3"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-9 px-3"
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
