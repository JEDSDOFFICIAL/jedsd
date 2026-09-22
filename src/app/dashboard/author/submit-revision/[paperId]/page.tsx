"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import axios from "axios";

import {
  Upload, FileText, ArrowLeft, Send, Loader2, AlertCircle,
  CheckCircle2, Lock, Eye, BookOpen, MessageSquare, X, File
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { uploadFileToFirebase } from "@/lib/Firebase-Action";
import { submitRevision } from "@/lib/Frontend-actions";

const ALLOWED_MANUSCRIPT_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_ZIP_TYPES = ["application/zip", "application/x-zip-compressed",
  "application/octet-stream", "application/x-zip"];
const MAX_SIZE = 30 * 1024 * 1024; // 30 MB

interface FileState {
  file: File | null;
  url: string | null;
  uploading: boolean;
  name: string;
  size: number;
}

const emptyFile = (): FileState => ({ file: null, url: null, uploading: false, name: "", size: 0 });

export default function SubmitRevisionPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // File states
  const [manuscript, setManuscript] = useState<FileState>(emptyFile());
  const [coverLetter, setCoverLetter] = useState<FileState>(emptyFile());
  const [sourceZip, setSourceZip] = useState<FileState>(emptyFile());

  // Text fields
  const [responseToReviewers, setResponseToReviewers] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");

  // Load paper details
  useEffect(() => {
    if (!paperId || sessionStatus !== "authenticated") return;
    setLoading(true);
    axios.get(`/api/paper?authorId=${session?.user?.id}`)
      .then(res => {
        const papers = res.data.papers || [];
        const found = papers.find((p: any) => p.id === paperId || p.paperId === paperId);
        setPaper(found || null);
      })
      .catch(() => toast.error("Failed to load paper details."))
      .finally(() => setLoading(false));
  }, [paperId, sessionStatus]);

  // ── File handlers ──────────────────────────────────────────────────────────

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileState>>,
    allowedTypes: string[],
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|pdf|doc|docx)$/i)) {
      toast.error(`Invalid file type for ${label}.`);
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(`${label} must be under 30 MB.`);
      return;
    }
    setter({ file, url: null, uploading: false, name: file.name, size: file.size });
    toast.success(`${label} selected: ${file.name}`);
  };

  const uploadSingleFile = async (
    state: FileState,
    setter: React.Dispatch<React.SetStateAction<FileState>>,
    folder: string
  ): Promise<string | null> => {
    if (!state.file) return state.url;
    setter(prev => ({ ...prev, uploading: true }));
    try {
      const url = await uploadFileToFirebase(state.file!, folder);
      if (!url) throw new Error("Upload returned null URL");
      setter(prev => ({ ...prev, url, uploading: false }));
      return url;
    } catch {
      setter(prev => ({ ...prev, uploading: false }));
      throw new Error(`Failed to upload ${state.name}`);
    }
  };

  const clearFile = (setter: React.Dispatch<React.SetStateAction<FileState>>) =>
    setter(emptyFile());

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!paper) return;
    if (!manuscript.file && !manuscript.url) {
      toast.error("Please upload the revised manuscript (PDF or DOCX).");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Uploading files…");

    try {
      // Upload manuscript
      toast.loading("Uploading revised manuscript…", { id: toastId });
      const manuscriptUrl = await uploadSingleFile(manuscript, setManuscript, "revisions/manuscripts");
      if (!manuscriptUrl) throw new Error("Manuscript upload failed.");

      // Upload cover letter (optional)
      let coverLetterUrl: string | null = null;
      if (coverLetter.file) {
        toast.loading("Uploading cover letter…", { id: toastId });
        coverLetterUrl = await uploadSingleFile(coverLetter, setCoverLetter, "revisions/cover-letters");
      }

      // Upload source ZIP (optional)
      let sourceZipUrl: string | null = null;
      if (sourceZip.file) {
        toast.loading("Uploading source files…", { id: toastId });
        sourceZipUrl = await uploadSingleFile(sourceZip, setSourceZip, "revisions/source-zips");
      }

      // Determine file type from extension
      const isDocx = manuscript.name.toLowerCase().endsWith(".docx") || manuscript.name.toLowerCase().endsWith(".doc");

      toast.loading("Submitting revision to editor…", { id: toastId });
      await submitRevision(paper.id, {
        revisedManuscriptUrl: manuscriptUrl,
        revisedManuscriptName: manuscript.name,
        revisedManuscriptSize: manuscript.size,
        revisedManuscriptType: isDocx ? "MANUSCRIPT_DOCX" : "MANUSCRIPT_PDF",
        coverLetterUrl,
        coverLetterName: coverLetter.name || null,
        coverLetterSize: coverLetter.size || null,
        sourceZipUrl,
        sourceZipName: sourceZip.name || null,
        sourceZipSize: sourceZip.size || null,
        responseToReviewers: responseToReviewers.trim() || null,
        revisionNotes: revisionNotes.trim() || null,
      });

      toast.success(
        "Revision submitted to the Editor. You will be notified when a decision is made.",
        { id: toastId, duration: 6000 }
      );
      router.push("/dashboard/author");
    } catch (err: any) {
      toast.error(err.message || "Submission failed.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / Guards ───────────────────────────────────────────────────────

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading…</span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span className="text-red-700">You must be signed in to submit a revision.</span>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span className="text-red-700">Paper not found or you don't have access.</span>
      </div>
    );
  }

  if (paper.status !== "REVISION_REQUESTED") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold">Revision not required</h2>
        <p className="text-slate-500 text-center max-w-md">
          This paper's current status is <strong>{paper.status.replace(/_/g, " ")}</strong>.
          Revisions can only be submitted when the status is <strong>REVISION REQUESTED</strong>.
        </p>
        <Button onClick={() => router.push("/dashboard/author")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const FileUploadCard = ({
    title, description, accept, onSelect, state, setter, required = false,
    accessNote, icon
  }: {
    title: string; description: string; accept: string;
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    state: FileState; setter: React.Dispatch<React.SetStateAction<FileState>>;
    required?: boolean; accessNote: string; icon: React.ReactNode;
  }) => (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
            {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            {accessNote}
          </div>
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {state.file ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">{state.name}</p>
              <p className="text-xs text-green-600">{(state.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!submitting && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFile(setter)}
                className="shrink-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload className="h-8 w-8 text-slate-400" />
            <span className="text-sm text-slate-600 text-center">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-slate-400">Max 30 MB</span>
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={onSelect}
              disabled={submitting}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/author")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Submit Revision</h1>
            <p className="text-slate-500 text-sm">Revise and resubmit your manuscript in response to editorial comments.</p>
          </div>
        </div>

        {/* Paper info */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Manuscript</p>
                <p className="font-semibold text-slate-900 mt-0.5 truncate">{paper.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <code className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{paper.paperId}</code>
                  <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                    Revision Requested
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Submitted {format(new Date(paper.submissionDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            {paper.editorComments && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-amber-500" />
                    Editor's Comments
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-900 whitespace-pre-wrap">{paper.editorComments}</p>
                  </div>
                </div>
              </>
            )}

            {/* Show reviewer comments for author */}
            {paper.reviews?.some((r: any) => r.reviewTextForAuthor) && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    Reviewer Comments
                  </p>
                  <div className="space-y-2">
                    {paper.reviews
                      .filter((r: any) => r.reviewTextForAuthor)
                      .map((r: any, i: number) => (
                        <div key={r.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-600 mb-1">Reviewer {i + 1}</p>
                          <p className="text-sm text-blue-900 whitespace-pre-wrap">{r.reviewTextForAuthor}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Important notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Privacy notice:</strong> Your revised files will be submitted directly to the Editor only.
            Reviewers will <strong>not</strong> automatically receive your files. The Editor will decide whether
            to send the revision for another round of review.
          </AlertDescription>
        </Alert>

        {/* File uploads */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Upload Revised Files</h2>

          <FileUploadCard
            title="Revised Manuscript"
            description="PDF, DOC, or DOCX — your updated manuscript."
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onSelect={(e) => handleFileSelect(e, setManuscript, ALLOWED_MANUSCRIPT_TYPES, "Revised Manuscript")}
            state={manuscript}
            setter={setManuscript}
            required
            accessNote="Author + Editor"
            icon={<FileText className="h-5 w-5 text-blue-600" />}
          />

          <FileUploadCard
            title="Cover Letter"
            description="PDF or DOCX — addressing the editor's comments and revision changes."
            accept=".pdf,.doc,.docx"
            onSelect={(e) => handleFileSelect(e, setCoverLetter, ALLOWED_MANUSCRIPT_TYPES, "Cover Letter")}
            state={coverLetter}
            setter={setCoverLetter}
            accessNote="Editor only"
            icon={<File className="h-5 w-5 text-amber-600" />}
          />

          <FileUploadCard
            title="LaTeX / Source Files (ZIP)"
            description="ZIP archive containing .tex, .bib, figures, and other source files."
            accept=".zip,application/zip,application/x-zip-compressed"
            onSelect={(e) => handleFileSelect(e, setSourceZip, ALLOWED_ZIP_TYPES, "Source ZIP")}
            state={sourceZip}
            setter={setSourceZip}
            accessNote="Editor only"
            icon={<File className="h-5 w-5 text-purple-600" />}
          />
        </div>

        {/* Text fields */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Response to Reviewers</h2>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                Point-by-point Response
              </CardTitle>
              <CardDescription>Explain how you addressed each reviewer comment.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Reviewer 1, Comment 1: …&#10;Our response: …&#10;&#10;Reviewer 2, Comment 1: …&#10;Our response: …"
                value={responseToReviewers}
                onChange={e => setResponseToReviewers(e.target.value)}
                className="min-h-[160px] resize-y"
                disabled={submitting}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revision Notes (Optional)</CardTitle>
              <CardDescription>Any additional notes for the editor about changes made.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Summary of major changes, additional context for the editor…"
                value={revisionNotes}
                onChange={e => setRevisionNotes(e.target.value)}
                className="min-h-[100px] resize-y"
                disabled={submitting}
              />
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/author")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !manuscript.file}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Submit Revision to Editor</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
