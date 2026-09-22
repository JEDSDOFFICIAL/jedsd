"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";

import {
  Loader2, AlertCircle, ArrowLeft, FileText, File, Download,
  CheckCircle2, XCircle, RefreshCw, Send, RotateCcw, Lock,
  Eye, Users, Star, Clock, MessageSquare, History, ChevronDown, ChevronUp
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  acceptRevision, requestRevision, startReviewRound,
  fetchRevisions, fetchReviewRounds, fetchReviewer,
} from "@/lib/Frontend-actions";
import type { ManuscriptRevision, ManuscriptFile, ReviewRound } from "@/types/dataTypes";

const FILE_TYPE_LABELS: Record<string, string> = {
  MANUSCRIPT_PDF: "Revised Manuscript (PDF)",
  MANUSCRIPT_DOCX: "Revised Manuscript (DOCX)",
  COVER_LETTER: "Cover Letter",
  SOURCE_ZIP: "Source Files (ZIP)",
  RESPONSE_TO_REVIEWERS: "Response to Reviewers",
  EDITOR_DECISION_FILE: "Editor Decision File",
  FINAL_PUBLICATION_FILE: "Final Publication File",
  OTHER: "Other File",
};

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  MANUSCRIPT_PDF: <FileText className="h-4 w-4 text-red-600" />,
  MANUSCRIPT_DOCX: <FileText className="h-4 w-4 text-blue-600" />,
  COVER_LETTER: <File className="h-4 w-4 text-amber-600" />,
  SOURCE_ZIP: <File className="h-4 w-4 text-purple-600" />,
};

const ACCESS_BADGE: Record<string, { label: string; color: string }> = {
  EDITOR_ONLY: { label: "Editor Only", color: "bg-red-100 text-red-700" },
  AUTHOR_EDITOR: { label: "Author + Editor", color: "bg-amber-100 text-amber-700" },
  REVIEWER_ASSIGNED: { label: "Reviewer Access", color: "bg-green-100 text-green-700" },
  PUBLIC: { label: "Public", color: "bg-slate-100 text-slate-700" },
};

export default function EditorRevisionDetailPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [paper, setPaper] = useState<any>(null);
  const [revisions, setRevisions] = useState<ManuscriptRevision[]>([]);
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Expanded revision sections
  const [expandedRevisions, setExpandedRevisions] = useState<Set<string>>(new Set());

  // Accept dialog
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptComments, setAcceptComments] = useState("");

  // Request further revision dialog
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionComments, setRevisionComments] = useState("");
  const [revisionDecision, setRevisionDecision] = useState<"MINOR_REVISION" | "MAJOR_REVISION">("MINOR_REVISION");

  // Reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComments, setRejectComments] = useState("");

  // Send for review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<string[]>([]);
  const [shareManuscript, setShareManuscript] = useState(true);
  const [shareCoverLetter, setShareCoverLetter] = useState(false);
  const [shareSourceZip, setShareSourceZip] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paperRes, revisionsRes, roundsRes, reviewerRes] = await Promise.allSettled([
        axios.get(`/api/paper/${paperId}`),
        fetchRevisions(paperId),
        fetchReviewRounds(paperId),
        fetchReviewer(),
      ]);

      if (paperRes.status === "fulfilled") setPaper(paperRes.value.data.paper);
      if (revisionsRes.status === "fulfilled" && revisionsRes.value?.revisions) {
        const revs: ManuscriptRevision[] = revisionsRes.value.revisions;
        setRevisions(revs);
        // Auto-expand the latest revision
        if (revs.length > 0) {
          setExpandedRevisions(new Set([revs[revs.length - 1].id]));
        }
      }
      if (roundsRes.status === "fulfilled" && roundsRes.value?.rounds) setRounds(roundsRes.value.rounds);
      if (reviewerRes.status === "fulfilled" && reviewerRes.value?.reviewers) setReviewers(reviewerRes.value.reviewers);
    } catch {
      toast.error("Failed to load revision details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paperId && sessionStatus === "authenticated") loadData();
  }, [paperId, sessionStatus]);

  const toggleRevision = (id: string) => {
    setExpandedRevisions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleAccept = async () => {
    if (!paper) return;
    setActionLoading(true);
    try {
      await acceptRevision(paper.id, acceptComments || undefined);
      setAcceptOpen(false);
      toast.success("Paper accepted!");
      router.push("/dashboard/editor/revisions");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!paper || !revisionComments.trim()) {
      toast.error("Please provide comments.");
      return;
    }
    setActionLoading(true);
    try {
      await requestRevision(paper.id, revisionComments, revisionDecision);
      setRevisionOpen(false);
      toast.success("Revision requested. Author notified.");
      loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!paper || !rejectComments.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`/api/paper/${paper.id}/reject-revision`, { comments: rejectComments });
      toast.success("Paper rejected.");
      setRejectOpen(false);
      router.push("/dashboard/editor/revisions");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendForReview = async () => {
    if (!paper || selectedReviewerIds.length === 0) {
      toast.error("Select at least one reviewer.");
      return;
    }
    setActionLoading(true);
    try {
      const latestRevision = revisions[revisions.length - 1];
      await startReviewRound(paper.id, selectedReviewerIds, {
        revisionId: latestRevision?.id,
        shareManuscript,
        shareCoverLetter,
        shareSourceZip,
      });
      setReviewDialogOpen(false);
      toast.success("New review round started. Reviewers notified.");
      loadData();
    } finally {
      setActionLoading(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading…</span>
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

  if (!paper) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span className="text-red-700">Paper not found.</span>
      </div>
    );
  }

  // Latest revision
  const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;
  const isRevisionSubmitted = paper.status === "REVISION_SUBMITTED";

  const FileRow = ({ file }: { file: ManuscriptFile }) => {
    const access = ACCESS_BADGE[file.accessLevel] ?? ACCESS_BADGE.EDITOR_ONLY;
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
        <div className="shrink-0">
          {FILE_TYPE_ICONS[file.fileType] ?? <File className="h-4 w-4 text-slate-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {FILE_TYPE_LABELS[file.fileType] ?? file.fileType}
          </p>
          <p className="text-xs text-slate-500 truncate">{file.fileName}</p>
          {file.fileSize && (
            <p className="text-xs text-slate-400">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${access.color}`}>
            {access.label}
          </span>
          <a href={file.filePath} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7 px-2">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/editor/revisions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inbox
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{paper.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{paper.paperId}</code>
              <Badge className={
                paper.status === "REVISION_SUBMITTED" ? "bg-blue-100 text-blue-800" :
                paper.status === "REVISION_REQUESTED" ? "bg-amber-100 text-amber-800" :
                paper.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                "bg-slate-100 text-slate-700"
              }>
                {paper.status.replace(/_/g, " ")}
              </Badge>
              {paper.author && (
                <span className="text-xs text-slate-500">by {paper.author.name}</span>
              )}
            </div>
          </div>
          <Button onClick={loadData} variant="ghost" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Action Buttons — only if revision has been submitted */}
        {isRevisionSubmitted && (
          <Card className="border-blue-200 bg-blue-50 shadow-none">
            <CardContent className="pt-4 pb-3">
              <p className="text-sm font-semibold text-blue-900 mb-3">
                ✅ Revision submitted by author. Choose your next action:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setAcceptOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Accept Revision
                </Button>
                <Button
                  onClick={() => setReviewDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Send for Review
                </Button>
                <Button
                  onClick={() => setRevisionOpen(true)}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Request Further Revision
                </Button>
                <Button
                  onClick={() => setRejectOpen(true)}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manuscript details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: metadata */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Manuscript Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Abstract</p>
                  <p className="text-slate-700 text-xs leading-relaxed line-clamp-4">{paper.abstract}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {paper.keywords?.slice(0, 6).map((k: string) => (
                      <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Submitted</p>
                  <p className="text-slate-700">{format(new Date(paper.submissionDate), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Last Updated</p>
                  <p className="text-slate-700">{formatDistanceToNow(new Date(paper.lastUpdated), { addSuffix: true })}</p>
                </div>
                {paper.editorDecision && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Last Editor Decision</p>
                    <Badge variant="outline">{paper.editorDecision.replace(/_/g, " ")}</Badge>
                  </div>
                )}
                <Separator />
                <a href={paper.filePath} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Original Manuscript
                  </Button>
                </a>
                {paper.coverLetterPath && (
                  <a href={paper.coverLetterPath} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full">
                      <File className="h-3.5 w-3.5 mr-1.5" />
                      Original Cover Letter
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Review rounds summary */}
            {rounds.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    Review History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rounds.map(round => (
                    <div key={round.id} className="text-sm border rounded-lg p-2 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Round {round.roundNumber}</span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(round.createdAt), "MMM d")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(round.reviews as any[])?.length ?? 0} reviewer(s) ·{" "}
                        {(round.reviews as any[])?.filter((r: any) =>
                          r.reviewerStatus !== "PENDING" && r.reviewerStatus !== "ACCEPTED_FOR_REVIEW"
                        ).length ?? 0} submitted
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: revisions + reviews */}
          <div className="lg:col-span-2 space-y-4">

            {/* Previous reviews */}
            {paper.reviews?.filter((r: any) => r.reviewTextForAuthor || r.reviewText).length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Reviewer Comments
                  </CardTitle>
                  <CardDescription>Reviews submitted by reviewers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paper.reviews
                    .filter((r: any) => r.reviewerStatus && r.reviewerStatus !== "PENDING" && r.reviewerStatus !== "ACCEPTED_FOR_REVIEW")
                    .map((review: any, i: number) => (
                      <div key={review.id} className="border rounded-lg p-3 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-600">Reviewer {i + 1}</span>
                          <div className="flex items-center gap-2">
                            {review.rating && (
                              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {review.rating}/5
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {review.reviewerStatus?.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                        {review.reviewText && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mb-1">
                              <Lock className="h-3 w-3" /> Private (Editor only)
                            </p>
                            <p className="text-xs text-slate-700 bg-red-50 rounded p-2 whitespace-pre-wrap">{review.reviewText}</p>
                          </div>
                        )}
                        {review.reviewTextForAuthor && (
                          <div>
                            <p className="text-xs font-medium text-blue-600 mb-1">For Author</p>
                            <p className="text-xs text-slate-700 bg-blue-50 rounded p-2 whitespace-pre-wrap">{review.reviewTextForAuthor}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Revision history */}
            {revisions.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Revision History ({revisions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...revisions].reverse().map(revision => {
                    const isExpanded = expandedRevisions.has(revision.id);
                    const isLatest = revision.id === latestRevision?.id;
                    return (
                      <div key={revision.id} className={`border rounded-lg overflow-hidden ${isLatest ? "border-blue-200" : "border-slate-200"}`}>
                        <button
                          onClick={() => toggleRevision(revision.id)}
                          className={`w-full flex items-center gap-3 p-3 text-left ${isLatest ? "bg-blue-50 hover:bg-blue-100" : "bg-slate-50 hover:bg-slate-100"} transition-colors`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">
                                Revision {revision.revisionNumber}
                              </span>
                              {isLatest && <Badge className="text-xs bg-blue-600 text-white">Latest</Badge>}
                              <Badge className={revision.visibleToReviewers ? "text-xs bg-green-100 text-green-700" : "text-xs bg-slate-100 text-slate-600"}>
                                {revision.visibleToReviewers ? "Shared with reviewers" : "Editor only"}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Submitted by {revision.submittedBy?.name} · {format(new Date(revision.submittedAt), "MMM d, yyyy HH:mm")}
                            </p>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white space-y-4">
                            {/* Files */}
                            {revision.files.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Files</p>
                                <div className="space-y-2">
                                  {revision.files.map(f => <FileRow key={f.id} file={f} />)}
                                </div>
                              </div>
                            )}

                            {/* Response to reviewers */}
                            {revision.responseToReviewers && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Response to Reviewers</p>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{revision.responseToReviewers}</p>
                                </div>
                              </div>
                            )}

                            {/* Revision notes */}
                            {revision.revisionNotes && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Revision Notes</p>
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{revision.revisionNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* No revisions yet */}
            {revisions.length === 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-600">No revisions submitted yet</p>
                  <p className="text-xs text-slate-400 mt-1">The author has not yet submitted a revised manuscript.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Accept Dialog ───────────────────────────────────────── */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Accept Revision
            </DialogTitle>
            <DialogDescription>
              Accepting this revision will set the paper status to ACCEPTED and notify the author.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Comments to author (optional)</Label>
            <Textarea
              value={acceptComments}
              onChange={e => setAcceptComments(e.target.value)}
              placeholder="Well done! The revision is satisfactory…"
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAccept}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Request Revision Dialog ─────────────────────────────── */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-600" />
              Request Further Revision
            </DialogTitle>
            <DialogDescription>The author will be notified and must resubmit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Decision</Label>
              <Select
                value={revisionDecision}
                onValueChange={v => setRevisionDecision(v as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MINOR_REVISION">Minor Revision Required</SelectItem>
                  <SelectItem value="MAJOR_REVISION">Major Revision Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comments to author <span className="text-red-500">*</span></Label>
              <Textarea
                value={revisionComments}
                onChange={e => setRevisionComments(e.target.value)}
                placeholder="Please address the following…"
                className="min-h-[120px] mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRequestRevision}
              disabled={actionLoading || !revisionComments.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ───────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Reject Paper
            </DialogTitle>
            <DialogDescription>This will permanently reject the paper. The author will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason for rejection <span className="text-red-500">*</span></Label>
            <Textarea
              value={rejectComments}
              onChange={e => setRejectComments(e.target.value)}
              placeholder="Unfortunately, despite the revision, the manuscript…"
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading || !rejectComments.trim()}
              variant="destructive"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Paper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send for Review Dialog ──────────────────────────────── */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Send Revision for Review
            </DialogTitle>
            <DialogDescription>
              Select reviewers and choose which files to share. Files not selected remain Editor-only.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File sharing options */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Files to share with reviewers</Label>
              <div className="space-y-2">
                {[
                  { key: "manuscript", label: "Revised Manuscript (PDF/DOCX)", value: shareManuscript, setter: setShareManuscript, recommended: true },
                  { key: "coverLetter", label: "Cover Letter", value: shareCoverLetter, setter: setShareCoverLetter, note: "Editor-only by default" },
                  { key: "sourceZip", label: "Source ZIP (LaTeX files)", value: shareSourceZip, setter: setShareSourceZip, note: "Editor-only by default" },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={e => item.setter(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      {item.recommended && <span className="ml-2 text-xs text-green-600">Recommended</span>}
                      {item.note && <p className="text-xs text-slate-400">{item.note}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reviewer selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Reviewers</Label>
              <ScrollArea className="h-48 border border-slate-200 rounded-lg p-2">
                {reviewers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No reviewers available.</p>
                ) : (
                  <div className="space-y-1">
                    {reviewers.map((r: any) => (
                      <label key={r.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedReviewerIds.includes(r.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedReviewerIds(prev => [...prev, r.id]);
                            } else {
                              setSelectedReviewerIds(prev => prev.filter(id => id !== r.id));
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{r.name || r.email}</p>
                          <p className="text-xs text-slate-400">{r.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {selectedReviewerIds.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">{selectedReviewerIds.length} reviewer(s) selected</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendForReview}
              disabled={actionLoading || selectedReviewerIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              <Send className="h-4 w-4 mr-1.5" />
              Send for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
