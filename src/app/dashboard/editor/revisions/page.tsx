"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import {
  Loader2, AlertCircle, RefreshCw, FileText, Clock, CheckCircle2,
  Eye, ArrowRight, FileInput, Inbox, Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EditorRevisionsInboxPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadRevisions = async () => {
    setLoading(true);
    try {
      // Fetch papers with REVISION_SUBMITTED or REVISION_REQUESTED status
      const [submitted, requested] = await Promise.all([
        axios.get("/api/paper?status=REVISION_SUBMITTED&limit=100"),
        axios.get("/api/paper?status=REVISION_REQUESTED&limit=100"),
      ]);
      const all = [
        ...(submitted.data.papers || []),
        ...(requested.data.papers || []),
      ];
      // Sort by lastUpdated desc
      all.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      setPapers(all);
    } catch {
      toast.error("Failed to load revisions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") loadRevisions();
  }, [sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading revisions…</span>
      </div>
    );
  }

  if (!session?.user || (session.user.variableUserType !== "EDITOR" && session.user.variableUserType !== "ADMIN")) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span className="text-red-700">Access denied: Editor or Admin role required.</span>
      </div>
    );
  }

  const filtered = papers.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.paperId.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const submitted = filtered.filter(p => p.status === "REVISION_SUBMITTED");
  const requested = filtered.filter(p => p.status === "REVISION_REQUESTED");

  const statusConfig: Record<string, { label: string; color: string }> = {
    REVISION_SUBMITTED: { label: "Revision Submitted", color: "bg-blue-100 text-blue-800" },
    REVISION_REQUESTED: { label: "Awaiting Author Revision", color: "bg-amber-100 text-amber-800" },
  };

  const PaperCard = ({ paper }: { paper: any }) => (
    <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{paper.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{paper.paperId}</code>
                  {paper.author && (
                    <span className="text-xs text-slate-500">by {paper.author.name}</span>
                  )}
                  <span className="text-xs text-slate-400">
                    updated {formatDistanceToNow(new Date(paper.lastUpdated), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Badge className={`text-xs shrink-0 ${statusConfig[paper.status]?.color ?? "bg-slate-100 text-slate-700"}`}>
                {statusConfig[paper.status]?.label ?? paper.status}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/dashboard/editor/revisions/${paper.id}`}>
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  {paper.status === "REVISION_SUBMITTED" ? "Review Revision" : "View Details"}
                </Button>
              </Link>
              <Link href={`/paper/${paper.paperId}`} target="_blank">
                <Button size="sm" variant="outline">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Original Paper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="h-6 w-6 text-blue-600" />
              Revisions Inbox
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review author-submitted revisions. You decide whether to accept, reject, or send for another review.
            </p>
          </div>
          <Button onClick={loadRevisions} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title, ID, or author…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-blue-100 bg-blue-50 shadow-none">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Awaiting Review</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{submitted.length}</p>
                </div>
                <FileInput className="h-8 w-8 text-blue-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-100 bg-amber-50 shadow-none">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">With Author</p>
                  <p className="text-3xl font-bold text-amber-900 mt-1">{requested.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submitted revisions — needs action */}
        {submitted.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Revisions Awaiting Your Review ({submitted.length})
            </h2>
            <div className="space-y-3">
              {submitted.map(p => <PaperCard key={p.id} paper={p} />)}
            </div>
          </section>
        )}

        {/* Requested — waiting on author */}
        {requested.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Revisions Requested — Awaiting Author ({requested.length})
            </h2>
            <div className="space-y-3">
              {requested.map(p => <PaperCard key={p.id} paper={p} />)}
            </div>
          </section>
        )}

        {/* Empty */}
        {papers.length === 0 && (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="h-14 w-14 text-slate-300 mb-4" />
              <h3 className="text-base font-semibold text-slate-700">No revisions at this time</h3>
              <p className="text-sm text-slate-400 mt-1">
                Revisions submitted by authors will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
