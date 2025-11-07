"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Send,
  Upload,
  Star,
  ArrowLeft,
  Download,
  CheckCircle,
  FileText,
  Clock,
  Calendar,
  User,
  Tag,
  Save,
  Eye,
  BookOpen,
  AlertTriangle,
  XCircle,
  Edit,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

import { fetchReviewerPapers, submitReview } from "@/lib/Frontend-actions";
import { uploadFileToFirebase } from "@/lib/Firebase-Action";
import { PaperWithRelations, ReviewFormData } from "@/types/dataTypes";
import { format, formatDistanceToNow } from "date-fns";

export default function WriteReviewPage() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const preSelectedPaperId = searchParams?.get("paperId");
  
  // State Management
  const [papers, setPapers] = useState<PaperWithRelations[]>([]);
  const [completedPapers, setCompletedPapers] = useState<PaperWithRelations[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<PaperWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"select" | "write" | "completed">("select");
  
  // Review Form State
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    reviewText: "",
    rating: 3,
    correspondingFile: null,
    reviewerStatus: "MINOR_REVISION",
    confidentialComments: "",
    recommendation: "MINOR_REVISION"
  });

  // Utility Functions
  const getUserReviewStatus = (paper: PaperWithRelations) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    return userReview?.reviewerStatus || "PENDING";
  };

  const hasSubmittedReview = (paper: PaperWithRelations) => {
    const status = getUserReviewStatus(paper);
    return status === "ACCEPTED_FOR_PUBLICATION" || 
           status === "REJECTED_FOR_PUBLICATION" || 
           status === "MINOR_REVISION" || 
           status === "MAJOR_REVISION";
  };

  // Load accepted papers
  const loadAcceptedPapers = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetchReviewerPapers(session.user.id, 1, 100);
      if (response && response.data) {
        const acceptedPapers = response.data.filter((paper: PaperWithRelations) => {
          const status = getUserReviewStatus(paper);
          return status === "ACCEPTED_FOR_REVIEW" && !hasSubmittedReview(paper);
        });
        
        const reviewedPapers = response.data.filter((paper: PaperWithRelations) => {
          return hasSubmittedReview(paper);
        });
        
        setPapers(acceptedPapers);
        setCompletedPapers(reviewedPapers);

        // Auto-select paper if paperId is in URL
        if (preSelectedPaperId) {
          const paper = acceptedPapers.find((p: PaperWithRelations) => p.id === preSelectedPaperId);
          if (paper) {
            setSelectedPaper(paper);
            setActiveTab("write");
          }
        }
      } else {
        setPapers([]);
        setCompletedPapers([]);
      }
    } catch (error) {
      console.error("Error fetching accepted papers:", error);
      toast.error("Failed to load your accepted papers.");
      setPapers([]);
      setCompletedPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setReviewForm(prev => ({ ...prev, correspondingFile: file }));
      toast.success(`File "${file.name}" selected`);
    }
  };

  // Calculate form completion
  const calculateFormCompletion = () => {
    let completed = 0;
    const total = 3; // reviewText, rating, decision
    
    if (reviewForm.reviewText.trim().length > 50) completed++;
    if (reviewForm.rating > 0) completed++;
    if (reviewForm.reviewerStatus) completed++;
    
    return (completed / total) * 100;
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedPaper || !session?.user?.id) {
      toast.error("Invalid session or paper data");
      return;
    }

    // Validation
    if (!reviewForm.reviewText.trim()) {
      toast.error("Please provide review comments");
      return;
    }

    if (reviewForm.reviewText.trim().length < 50) {
      toast.error("Review comments must be at least 50 characters");
      return;
    }

    if (!reviewForm.rating) {
      toast.error("Please provide a rating");
      return;
    }

    if (!reviewForm.reviewerStatus) {
      toast.error("Please provide a recommendation");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting your review...");

    try {
      let uploadedFileUrl = null;

      if (reviewForm.correspondingFile) {
        toast.loading("Uploading file...", { id: toastId });
        uploadedFileUrl = await uploadFileToFirebase(
          reviewForm.correspondingFile, 
          `reviews/${selectedPaper.id}`
        );
        
        if (!uploadedFileUrl) {
          toast.error("Failed to upload file", { id: toastId });
          setSubmitting(false);
          return;
        }
      }

      await submitReview(
        selectedPaper.id,
        session.user.id,
        reviewForm.reviewText,
        reviewForm.rating,
        reviewForm.reviewerStatus,
        uploadedFileUrl,
        () => {
          toast.success("Review submitted successfully!", { id: toastId });
          
          // Reset form
          setReviewForm({
            reviewText: "",
            rating: 3,
            correspondingFile: null,
            reviewerStatus: "MINOR_REVISION",
            confidentialComments: "",
            recommendation: "MINOR_REVISION"
          });
          setSelectedPaper(null);
          setActiveTab("select");
          
          // Reload papers
          loadAcceptedPapers();
        }
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadAcceptedPapers();
    }
  }, [sessionStatus]);

  // Loading State
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  // Access Control
  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-lg text-red-700">
          Access Denied: You must be logged in to view this page.
        </span>
      </div>
    );
  }

  // Stats
  const stats = {
    pending: papers.length,
    completed: completedPapers.length,
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Write Reviews
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit your reviews for accepted papers
            </p>
          </div>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-50 mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <Clock className="h-12 w-12 text-amber-100 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-50 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.completed}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-100 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "select" | "write" | "completed")}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="select" className="text-base">
              <FileText className="h-4 w-4 mr-2" />
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="write" disabled={!selectedPaper} className="text-base">
              <Edit className="h-4 w-4 mr-2" />
              Write Review
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-base">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed ({stats.completed})
            </TabsTrigger>
          </TabsList>

          {/* Select Paper Tab */}
          <TabsContent value="select" className="space-y-4">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Select a Paper to Review</CardTitle>
                <CardDescription>
                  Choose from papers you've accepted for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {papers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No papers to review</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      You haven't accepted any papers for review yet. Go to the Allocated Papers page to accept assignments.
                    </p>
                    <Button asChild>
                      <a href="/dashboard/reviewer/allocated">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go to Allocated Papers
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {papers.map((paper) => (
                      <Card
                        key={paper.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedPaper?.id === paper.id 
                            ? "ring-2 ring-emerald-500 shadow-lg" 
                            : "hover:ring-1 hover:ring-emerald-200"
                        }`}
                        onClick={() => {
                          setSelectedPaper(paper);
                          setActiveTab("write");
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary">{paper.paperId}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(paper.submissionDate), { addSuffix: true })}
                            </span>
                          </div>
                          <CardTitle className="text-base line-clamp-2">{paper.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="truncate">{paper.author?.name || "Unknown"}</span>
                          </div>

                          {paper.keywords && paper.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {paper.keywords.slice(0, 3).map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {paper.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{paper.keywords.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <Button 
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPaper(paper);
                              setActiveTab("write");
                            }}
                          >
                            Review This Paper
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Write Review Tab */}
          <TabsContent value="write" className="space-y-6">
            {selectedPaper && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Paper Info */}
                <div className="lg:col-span-1 space-y-4">
                  <Card className="shadow-lg border-none sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Paper Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <p className="font-medium text-sm mt-1">{selectedPaper.title}</p>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">Paper ID</Label>
                        <p className="font-mono text-sm mt-1">{selectedPaper.paperId}</p>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">Author</Label>
                        <p className="text-sm mt-1">{selectedPaper.author?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{selectedPaper.author?.email}</p>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">Submitted</Label>
                        <p className="text-sm mt-1">
                          {format(new Date(selectedPaper.submissionDate), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedPaper.submissionDate), { addSuffix: true })}
                        </p>
                      </div>

                      {selectedPaper.keywords && selectedPaper.keywords.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Keywords</Label>
                            <div className="flex flex-wrap gap-1">
                              {selectedPaper.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(selectedPaper.filePath, "_blank")}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View Manuscript
                        </Button>
                       
                      </div>

                      {selectedPaper.abstract && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Abstract</Label>
                            <ScrollArea className="h-[200px]">
                              <p className="text-sm text-muted-foreground pr-4">
                                {selectedPaper.abstract}
                              </p>
                            </ScrollArea>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Review Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Progress Card */}
                  <Card className="shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Form Completion</span>
                          <span className="text-muted-foreground">
                            {Math.round(calculateFormCompletion())}%
                          </span>
                        </div>
                        <Progress value={calculateFormCompletion()} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Review Form */}
                  <Card className="shadow-lg border-none">
                    <CardHeader>
                      <CardTitle>Your Review</CardTitle>
                      <CardDescription>
                        Provide detailed feedback and your recommendation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Review Comments */}
                      <div className="space-y-2">
                        <Label htmlFor="reviewText" className="flex items-center gap-2">
                          Review Comments *
                          <Badge variant="secondary" className="text-xs">
                            {reviewForm.reviewText.trim().length} chars
                          </Badge>
                        </Label>
                        <Textarea
                          id="reviewText"
                          placeholder="Provide detailed, constructive feedback on the paper's strengths, weaknesses, methodology, results, and contribution to the field..."
                          value={reviewForm.reviewText}
                          onChange={(e) => setReviewForm(prev => ({
                            ...prev,
                            reviewText: e.target.value
                          }))}
                          className="min-h-[200px] resize-y"
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum 50 characters required
                        </p>
                      </div>

                      <Separator />

                      {/* Rating and Decision Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rating */}
                        <div className="space-y-2">
                          <Label htmlFor="rating">Paper Quality Rating *</Label>
                          <Select
                            value={reviewForm.rating.toString()}
                            onValueChange={(value) => setReviewForm(prev => ({
                              ...prev,
                              rating: parseInt(value)
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {Array.from({ length: rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      ))}
                                      {Array.from({ length: 5 - rating }).map((_, i) => (
                                        <Star key={i + rating} className="w-4 h-4 text-gray-300" />
                                      ))}
                                    </div>
                                    <span>
                                      {rating === 1 ? "Poor" :
                                       rating === 2 ? "Fair" :
                                       rating === 3 ? "Good" :
                                       rating === 4 ? "Very Good" :
                                       "Excellent"}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Publication Decision */}
                        <div className="space-y-2">
                          <Label htmlFor="decision">Publication Recommendation *</Label>
                          <Select
                            value={reviewForm.reviewerStatus}
                            onValueChange={(value) => setReviewForm(prev => ({
                              ...prev,
                              reviewerStatus: value as "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "MINOR_REVISION" | "MAJOR_REVISION"
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACCEPTED_FOR_PUBLICATION">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Accept for Publication
                                </div>
                              </SelectItem>
                              <SelectItem value="MINOR_REVISION">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  Minor Revisions Required
                                </div>
                              </SelectItem>
                              <SelectItem value="MAJOR_REVISION">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                                  Major Revisions Required
                                </div>
                              </SelectItem>
                              <SelectItem value="REJECTED_FOR_PUBLICATION">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  Reject for Publication
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Confidential Comments */}
                      <div className="space-y-2">
                        <Label htmlFor="confidentialComments" className="flex items-center gap-2">
                          Confidential Comments to Editor
                          <Badge variant="outline" className="text-xs">Optional</Badge>
                        </Label>
                        <Textarea
                          id="confidentialComments"
                          placeholder="Private comments for the editor only (not shared with authors)..."
                          value={reviewForm.confidentialComments || ""}
                          onChange={(e) => setReviewForm(prev => ({ 
                            ...prev, 
                            confidentialComments: e.target.value 
                          }))}
                          className="min-h-[100px]"
                        />
                      </div>

                      <Separator />

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="file" className="flex items-center gap-2">
                          Annotated Manuscript or Supporting File
                          <Badge variant="outline" className="text-xs">Optional</Badge>
                        </Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="flex-1"
                          />
                          {reviewForm.correspondingFile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewForm(prev => ({ ...prev, correspondingFile: null }))}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        {reviewForm.correspondingFile && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                            <CheckCircle className="h-4 w-4" />
                            <span>{reviewForm.correspondingFile.name}</span>
                            <span className="text-muted-foreground">
                              ({(reviewForm.correspondingFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Upload an annotated version of the paper or additional materials. Max file size: 10MB
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <Card className="shadow-lg border-none">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPaper(null);
                            setActiveTab("select");
                            setReviewForm({
                              reviewText: "",
                              rating: 3,
                              correspondingFile: null,
                              reviewerStatus: "MINOR_REVISION",
                              confidentialComments: "",
                              recommendation: "MINOR_REVISION"
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitReview}
                          disabled={
                            submitting || 
                            !reviewForm.reviewText.trim() || 
                            reviewForm.reviewText.trim().length < 50
                          }
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Review
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Completed Reviews Tab */}
          <TabsContent value="completed" className="space-y-4">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Completed Reviews</CardTitle>
                <CardDescription>
                  Papers you've already reviewed and submitted feedback for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedPapers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No completed reviews</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You haven't submitted any reviews yet. Select a paper from the Pending tab to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedPapers.map((paper) => {
                      const userReview = paper.reviews?.find(r => r.reviewerId === session.user.id);
                      const status = getUserReviewStatus(paper);
                      
                      return (
                        <Card
                          key={paper.id}
                          className="border-l-4 hover:shadow-md transition-shadow"
                          style={{
                            borderLeftColor: status === "ACCEPTED_FOR_PUBLICATION" ? "#22c55e" : "#ef4444"
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={
                                    status === "ACCEPTED_FOR_PUBLICATION" ? "default" : 
                                    status === "MINOR_REVISION" ? "secondary" :
                                    status === "MAJOR_REVISION" ? "outline" :
                                    "destructive"
                                  }>
                                    {status === "ACCEPTED_FOR_PUBLICATION" ? "Recommended: Accept" : 
                                     status === "MINOR_REVISION" ? "Recommended: Minor Revision" :
                                     status === "MAJOR_REVISION" ? "Recommended: Major Revision" :
                                     "Recommended: Reject"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {paper.paperId}
                                  </Badge>
                                </div>
                                <CardTitle className="text-lg mb-2">{paper.title}</CardTitle>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {paper.author?.name || "Unknown"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Submitted: {format(new Date(paper.submissionDate), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              </div>

                              {userReview?.rating && (
                                <div className="flex flex-col items-end gap-1">
                                  <Label className="text-xs text-muted-foreground">Your Rating</Label>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < (userReview.rating || 0)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium">{userReview.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {paper.keywords && paper.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {paper.keywords.map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {userReview?.reviewText && (
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Your Review Comments</Label>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {userReview.reviewText.length > 300 
                                      ? `${userReview.reviewText.substring(0, 300)}...` 
                                      : userReview.reviewText}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(paper.filePath, "_blank")}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                View Paper
                              </Button>
                              {userReview?.correspondingFile && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(userReview.correspondingFile!, "_blank")}
                                  className="flex-1"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Your Review File
                                </Button>
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              <div className="flex items-center justify-between">
                                <span>
                                  Review submitted {userReview?.createdAt 
                                    ? formatDistanceToNow(new Date(userReview.createdAt), { addSuffix: true })
                                    : "recently"}
                                </span>
                                {userReview?.correspondingFile && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Includes file
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
