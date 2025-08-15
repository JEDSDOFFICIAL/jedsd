"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Star,
  Download,
  Upload,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  submissionDate: string;
  status: string;
  author: {
    name: string;
    email: string;
  };
  reviews?: {
    id: string;
    reviewerId: string;
    reviewText: string;
    rating: number;
    reviewerStatus: string;
  }[];
}

interface ReviewForm {
  reviewText: string;
  rating: number;
  correspondingFile: File | null;
  reviewerStatus: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION";
}

export default function ReviewerDashboard() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    reviewText: "",
    rating: 1,
    correspondingFile: null,
    reviewerStatus: "ACCEPTED_FOR_PUBLICATION"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"assigned" | "completed">("assigned");

  // Fetch papers assigned to reviewer
  useEffect(() => {
    fetchAssignedPapers();
  }, [session]);

  const fetchAssignedPapers = async () => {
    try {
      const response = await axios.get("/api/paper/reviewer-papers");
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch assigned papers");
    }
  };

  // Handle accept/reject paper for review
  const handlePaperAcceptance = async (paperId: string, action: "accept" | "reject") => {
    try {
      const response = await axios.post("/api/paper/reviewer-acceptance", {
        paperId,
        reviewerId: session?.user?.id,
        type: action
      });

      if (response.data.success) {
        toast.success(`Paper ${action}ed successfully`);
        fetchAssignedPapers();
      }
    } catch (error) {
      console.error("Error updating paper acceptance:", error);
      toast.error(`Failed to ${action} paper`);
    }
  };

  // Handle review submission
  const handleReviewSubmission = async () => {
    if (!selectedPaper || !reviewForm.reviewText.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting review...");

    try {
      let uploadedFileUrl = null;

      // Upload file if provided
      if (reviewForm.correspondingFile) {
        const formData = new FormData();
        formData.append("file", reviewForm.correspondingFile);
        formData.append("path", `reviews/${selectedPaper.id}`);
        
        const uploadResponse = await axios.post("/api/upload", formData);
        uploadedFileUrl = uploadResponse.data.url;
      }

      // Submit review
      const reviewResponse = await axios.post("/api/paper/review", {
        paperId: selectedPaper.id,
        reviewerId: session?.user?.id,
        reviewText: reviewForm.reviewText,
        rating: reviewForm.rating,
        correspondingFile: uploadedFileUrl,
        reviewerStatus: reviewForm.reviewerStatus
      });

      if (reviewResponse.data.success) {
        toast.success("Review submitted successfully!", { id: toastId });
        setSelectedPaper(null);
        setReviewForm({
          reviewText: "",
          rating: 1,
          correspondingFile: null,
          reviewerStatus: "ACCEPTED_FOR_PUBLICATION"
        });
        fetchAssignedPapers();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user's review status for a paper
  const getUserReviewStatus = (paper: Paper) => {
    if (!paper.reviews || !session?.user?.id) return "PENDING";
    
    const userReview = paper.reviews.find(
      (review) => review.reviewerId === session.user.id
    );
    
    return userReview?.reviewerStatus || "PENDING";
  };

  // Check if user has submitted review for a paper
  const hasSubmittedReview = (paper: Paper) => {
    if (!paper.reviews || !session?.user?.id) return false;
    
    return paper.reviews.some(
      (review) => review.reviewerId === session.user.id && review.reviewText
    );
  };

  // Filter papers based on active tab
  const filteredPapers = papers.filter(paper => {
    const hasReview = hasSubmittedReview(paper);
    return activeTab === "assigned" ? !hasReview : hasReview;
  });

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      ACCEPTED_FOR_REVIEW: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      REJECTED_FOR_REVIEW: { color: "bg-red-100 text-red-800", icon: XCircle },
      ACCEPTED_FOR_PUBLICATION: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      REJECTED_FOR_PUBLICATION: { color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your review assignments and submissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => !hasSubmittedReview(p)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => hasSubmittedReview(p)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {papers.filter(p => getUserReviewStatus(p) === "ACCEPTED_FOR_PUBLICATION").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === "assigned" ? "default" : "ghost"}
          onClick={() => setActiveTab("assigned")}
          className="flex-1"
        >
          Assigned Papers ({papers.filter(p => !hasSubmittedReview(p)).length})
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "ghost"}
          onClick={() => setActiveTab("completed")}
          className="flex-1"
        >
          Completed Reviews ({papers.filter(p => hasSubmittedReview(p)).length})
        </Button>
      </div>

      {/* Papers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "assigned" ? "Papers Assigned for Review" : "Completed Reviews"}
          </CardTitle>
          <CardDescription>
            {activeTab === "assigned" 
              ? "Accept papers for review and submit your reviews"
              : "View your completed review submissions"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredPapers.map((paper) => (
                  <motion.tr
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{paper.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {paper.abstract}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{paper.author.name}</p>
                        <p className="text-sm text-muted-foreground">{paper.author.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(paper.submissionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(getUserReviewStatus(paper))}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* View Paper Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(paper.filePath, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>

                      {activeTab === "assigned" && !hasSubmittedReview(paper) && (
                        <>
                          {/* Accept/Reject for Review */}
                          {getUserReviewStatus(paper) === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePaperAcceptance(paper.id, "accept")}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePaperAcceptance(paper.id, "reject")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {/* Submit Review Button */}
                          {getUserReviewStatus(paper) === "ACCEPTED_FOR_REVIEW" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedPaper(paper)}
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  Submit Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Submit Review</DialogTitle>
                                  <DialogDescription>
                                    Submit your review for {paper.title}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  {/* Review Text */}
                                  <div>
                                    <Label htmlFor="reviewText">Review Text *</Label>
                                    <Textarea
                                      id="reviewText"
                                      placeholder="Enter your detailed review..."
                                      value={reviewForm.reviewText}
                                      onChange={(e) => setReviewForm(prev => ({
                                        ...prev,
                                        reviewText: e.target.value
                                      }))}
                                      className="min-h-[120px]"
                                    />
                                  </div>

                                  {/* Rating */}
                                  <div>
                                    <Label htmlFor="rating">Rating (1-5) *</Label>
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
                                                  <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                                                ))}
                                              </div>
                                              {rating} Star{rating !== 1 ? 's' : ''}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* File Upload */}
                                  <div>
                                    <Label htmlFor="file">Corresponding File (Optional)</Label>
                                    <Input
                                      id="file"
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      onChange={(e) => setReviewForm(prev => ({
                                        ...prev,
                                        correspondingFile: e.target.files?.[0] || null
                                      }))}
                                    />
                                  </div>

                                  {/* Publication Decision */}
                                  <div>
                                    <Label htmlFor="decision">Publication Decision *</Label>
                                    <Select
                                      value={reviewForm.reviewerStatus}
                                      onValueChange={(value) => setReviewForm(prev => ({
                                        ...prev,
                                        reviewerStatus: value as "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION"
                                      }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ACCEPTED_FOR_PUBLICATION">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Accept for Publication
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="REJECTED_FOR_PUBLICATION">
                                          <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-600" />
                                            Reject for Publication
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedPaper(null)}
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleReviewSubmission}
                                    disabled={isSubmitting || !reviewForm.reviewText.trim()}
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Submit Review
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {filteredPapers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === "assigned" ? "No Pending Reviews" : "No Completed Reviews"}
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "assigned" 
                  ? "You don't have any papers assigned for review at the moment."
                  : "You haven't completed any reviews yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
