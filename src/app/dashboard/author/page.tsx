"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { ResearchPaper } from "@prisma/client";

import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Upload,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const [loading, setLoading] = useState(true);

  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [viewingPaperId, setViewingPaperId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [stats, setStats] = useState<AuthorStats>({
    totalPapers: 0,
    papersInReview: 0,
    papersAccepted: 0,
    papersRejected: 0,
    papersPublished: 0,
    pendingAllocation: 0,
    averageRating: 0,
  });

  /* -------------------------------------------------------------
     Statistics
  ------------------------------------------------------------- */

  const calculateStats = (papersData: ResearchPaper[]): AuthorStats => {
    let papersInReview = 0;
    let papersAccepted = 0;
    let papersRejected = 0;
    let papersPublished = 0;
    let pendingAllocation = 0;

    let totalRating = 0;
    let ratingsCount = 0;

    papersData.forEach((paper) => {
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

      if (paper.rating) {
        totalRating += paper.rating;
        ratingsCount++;
      }
    });

    return {
      totalPapers: papersData.length,
      papersInReview,
      papersAccepted,
      papersRejected,
      papersPublished,
      pendingAllocation,
      averageRating:
        ratingsCount > 0 ? totalRating / ratingsCount : 0,
    };
  };

  /* -------------------------------------------------------------
     Data
  ------------------------------------------------------------- */

  const loadAuthorData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `/api/paper?authorId=${session.user.id}`
      );

      const fetchedPapers = response.data.papers || [];

      setPapers(fetchedPapers);
      setStats(calculateStats(fetchedPapers));
    } catch (error) {
      console.error("Error loading author data:", error);
      toast.error("Failed to load your papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadAuthorData();
    }
  }, [sessionStatus]);

  /* -------------------------------------------------------------
     Actions
  ------------------------------------------------------------- */

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

  /* -------------------------------------------------------------
     Derived data
  ------------------------------------------------------------- */

  const recentInReviewPapers = useMemo(
    () =>
      papers
        .filter((paper) => paper.status === "ON_REVIEW")
        .slice(0, 3),
    [papers]
  );

  const recentPublishedPapers = useMemo(
    () =>
      papers
        .filter((paper) => paper.status === "PUBLISH")
        .slice(0, 3),
    [papers]
  );

  const acceptanceRate =
    stats.totalPapers > 0
      ? Math.round(
          (stats.papersAccepted / stats.totalPapers) * 100
        )
      : 0;

  const reviewRate =
    stats.totalPapers > 0
      ? Math.round(
          (stats.papersInReview / stats.totalPapers) * 100
        )
      : 0;

  const publishedRate =
    stats.totalPapers > 0
      ? Math.round(
          (stats.papersPublished / stats.totalPapers) * 100
        )
      : 0;

  const columns = createColumns({
    onEditPaper: handleEditPaper,
    onViewPaper: handleViewPaper,
  });

  /* -------------------------------------------------------------
     Loading
  ------------------------------------------------------------- */

  if (sessionStatus === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
          Loading author workspace...
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------
     Access control
  ------------------------------------------------------------- */

  if (!session || !session.user) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Access denied
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You must be logged in as an author to access this
            workspace.
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------
     Dashboard
  ------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <section className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Author Workspace
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Welcome back, {session.user.name}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your manuscripts, reviews and publications.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={loadAuthorData}
                disabled={loading}
                className="h-10 border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}

                Refresh
              </Button>

              <Link href="/dashboard/author/upload">
                <Button className="h-10 bg-slate-900 px-4 text-white shadow-sm hover:bg-slate-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Manuscript
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            METRICS
        ========================================================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total */}
          <MetricCard
            label="Total Manuscripts"
            value={stats.totalPapers}
            description="All submitted manuscripts"
            icon={<FileText className="h-5 w-5" />}
          />

          {/* Review */}
          <MetricCard
            label="Under Review"
            value={stats.papersInReview}
            description={`${reviewRate}% of your submissions`}
            icon={<Clock3 className="h-5 w-5" />}
          />

          {/* Accepted */}
          <MetricCard
            label="Accepted"
            value={stats.papersAccepted}
            description={`${acceptanceRate}% acceptance rate`}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          {/* Published */}
          <MetricCard
            label="Published"
            value={stats.papersPublished}
            description={`${publishedRate}% of submissions`}
            icon={<Award className="h-5 w-5" />}
          />
        </section>

        {/* =========================================================
            MAIN ANALYTICS
        ========================================================= */}

        <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">

          {/* Submission Pipeline */}
          <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-950">
                    Submission Pipeline
                  </CardTitle>

                  <CardDescription className="mt-1 text-sm text-slate-500">
                    Current distribution of your manuscripts.
                  </CardDescription>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <BarChart3 className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 py-6">

              <PipelineRow
                label="Pending allocation"
                value={stats.pendingAllocation}
                total={stats.totalPapers}
                percentage={
                  stats.totalPapers
                    ? (stats.pendingAllocation /
                        stats.totalPapers) *
                      100
                    : 0
                }
                indicator="bg-slate-400"
              />

              <PipelineRow
                label="Under review"
                value={stats.papersInReview}
                total={stats.totalPapers}
                percentage={
                  stats.totalPapers
                    ? (stats.papersInReview /
                        stats.totalPapers) *
                      100
                    : 0
                }
                indicator="bg-blue-600"
              />

              <PipelineRow
                label="Accepted"
                value={stats.papersAccepted}
                total={stats.totalPapers}
                percentage={
                  stats.totalPapers
                    ? (stats.papersAccepted /
                        stats.totalPapers) *
                      100
                    : 0
                }
                indicator="bg-emerald-600"
              />

              <PipelineRow
                label="Published"
                value={stats.papersPublished}
                total={stats.totalPapers}
                percentage={
                  stats.totalPapers
                    ? (stats.papersPublished /
                        stats.totalPapers) *
                      100
                    : 0
                }
                indicator="bg-slate-900"
              />

              <PipelineRow
                label="Rejected"
                value={stats.papersRejected}
                total={stats.totalPapers}
                percentage={
                  stats.totalPapers
                    ? (stats.papersRejected /
                        stats.totalPapers) *
                      100
                    : 0
                }
                indicator="bg-red-500"
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-base font-semibold text-slate-950">
                Quick Actions
              </CardTitle>

              <CardDescription className="mt-1">
                Frequently used author tools.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 p-5">

              <Link
                href="/dashboard/author/upload"
                className="group block"
              >
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Upload className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      Submit manuscript
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Upload a new research paper
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>

              <button
                type="button"
                disabled={papers.length === 0}
                onClick={() =>
                  document
                    .getElementById("my-papers-section")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <FileText className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    View manuscripts
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Manage your submitted papers
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="rounded-md bg-slate-100 text-slate-700"
                >
                  {stats.totalPapers}
                </Badge>
              </button>

              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-600">
                    Detailed statistics
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Advanced analytics coming soon
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="rounded-md border-slate-200 text-slate-400"
                >
                  Soon
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* =========================================================
            RECENT ACTIVITY
        ========================================================= */}

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Review */}
          <PaperActivityCard
            title="Under Review"
            description="Manuscripts currently being evaluated."
            icon={<Clock3 className="h-4 w-4" />}
            iconClass="bg-blue-50 text-blue-700"
            emptyIcon={<FileCheck2 className="h-6 w-6" />}
            emptyTitle="No manuscripts under review"
            emptyDescription="Your active reviews will appear here."
            papers={recentInReviewPapers}
            status="Review"
            onView={handleViewPaper}
          />

          {/* Published */}
          <PaperActivityCard
            title="Published Papers"
            description="Your most recently published work."
            icon={<Award className="h-4 w-4" />}
            iconClass="bg-slate-100 text-slate-700"
            emptyIcon={<FileText className="h-6 w-6" />}
            emptyTitle="No published papers yet"
            emptyDescription="Accepted publications will appear here."
            papers={recentPublishedPapers}
            status="Published"
            onView={handleViewPaper}
          />
        </section>

        {/* =========================================================
            MANUSCRIPTS TABLE
        ========================================================= */}

        <section id="my-papers-section" className="scroll-mt-8">

          <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <FileText className="h-4 w-4 text-slate-700" />
                    </div>

                    <CardTitle className="text-base font-semibold text-slate-950">
                      My Manuscripts
                    </CardTitle>
                  </div>

                  <CardDescription className="mt-2">
                    View, edit and manage all submitted manuscripts.
                  </CardDescription>
                </div>

                <Link href="/dashboard/author/upload">
                  <Button className="h-9 bg-slate-900 px-4 text-white hover:bg-slate-800">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Paper
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0">

              {papers.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <FileText className="h-6 w-6 text-slate-500" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">
                    No manuscripts submitted
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    You have not submitted any manuscripts yet.
                    Start your first submission to begin the review
                    process.
                  </p>

                  <Link
                    href="/dashboard/author/upload"
                    className="mt-5"
                  >
                    <Button className="bg-slate-900 hover:bg-slate-800">
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Your First Paper
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="px-2 sm:px-4 lg:px-6">
                  <DataTable
                    columns={columns}
                    data={papers}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* =========================================================
          MODALS
      ========================================================= */}

      <EditPaperModal
        paperId={editingPaperId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPaperId(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <ViewPaperModal
        paperId={viewingPaperId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingPaperId(null);
        }}
      />
    </main>
  );
}

/* ===============================================================
   METRIC CARD
================================================================ */

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <CardContent className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              {label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===============================================================
   PIPELINE ROW
================================================================ */

function PipelineRow({
  label,
  value,
  total,
  percentage,
  indicator,
}: {
  label: string;
  value: number;
  total: number;
  percentage: number;
  indicator: string;
}) {
  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${indicator}`}
          />

          <span className="text-sm font-medium text-slate-700">
            {label}
          </span>
        </div>

        <span className="text-xs font-medium tabular-nums text-slate-500">
          {value} / {total}
        </span>
      </div>

      <Progress
        value={percentage}
        className="h-1.5 bg-slate-100"
      />
    </div>
  );
}

/* ===============================================================
   PAPER ACTIVITY CARD
================================================================ */

function PaperActivityCard({
  title,
  description,
  icon,
  iconClass,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  papers,
  status,
  onView,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  papers: ResearchPaper[];
  status: string;
  onView: (paperId: string) => void;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

      <CardHeader className="border-b border-slate-100 px-6 py-5">

        <div className="flex items-start gap-3">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <CardTitle className="text-base font-semibold text-slate-950">
              {title}
            </CardTitle>

            <CardDescription className="mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">

        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">

            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              {emptyIcon}
            </div>

            <p className="text-sm font-medium text-slate-700">
              {emptyTitle}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-2">

            {papers.map((paper) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => onView(paper.paperId)}
                className="group flex w-full items-center gap-4 rounded-xl border border-transparent p-3 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-4 w-4 text-slate-600" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium text-slate-800">
                    {paper.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {status === "Published"
                      ? paper.acceptedDate
                        ? `Published ${formatDistanceToNow(
                            new Date(paper.acceptedDate),
                            {
                              addSuffix: true,
                            }
                          )}`
                        : "Published"
                      : `Submitted ${formatDistanceToNow(
                          new Date(paper.submissionDate),
                          {
                            addSuffix: true,
                          }
                        )}`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">

                  {paper.rating && (
                    <span className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
                      <Star className="h-3 w-3 fill-current text-amber-500" />
                      {paper.rating}
                    </span>
                  )}

                  <Badge
                    variant="outline"
                    className="rounded-md border-slate-200 bg-white text-xs text-slate-600"
                  >
                    {status}
                  </Badge>

                  <Eye className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}