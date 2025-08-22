"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  ArrowLeft, 
  Star, 
  User, 
  Calendar,
  MessageSquare,
  Download,
  Mail,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  BookOpen,
  Users
} from "lucide-react";
import Link from "next/link";
import { fetchPaperReviews } from "@/lib/Frontend-actions";
import { PaperReview, User as UserType, ReviewerStatus } from "@prisma/client";

interface PaperReviewWithReviewer extends PaperReview {
  reviewer: UserType;
}

interface PaperWithReviews {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  submissionDate: string;
  status: string;
  rating: number | null;
  acceptedDate: string | null;
  author: {
    id: string;
    name: string;
    email: string;
    affiliation?: string;
  };
  reviews: PaperReviewWithReviewer[];
  contributors: any[];
  pointOfContact: any;
}

interface EditorDecision {
  decision: 'ACCEPT' | 'REJECT' | 'REVISION_REQUIRED';
  comments: string;
  feedbackToAuthor: string;
}

export default function EditorReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const paperId = params?.id as string;

  const [paper, setPaper] = useState<PaperWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [editorDecision, setEditorDecision] = useState<EditorDecision>({
    decision: 'ACCEPT',
    comments: '',
    feedbackToAuthor: ''
  });

  const [showDecisionForm, setShowDecisionForm] = useState(false);

  useEffect(() => {
    if (paperId) {
      fetchPaperDetails();
    }
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/paper/${paperId}`);
      if (response.ok) {
        const paperData = await response.json();
        
        // Fetch reviews for this paper
        const reviewsResponse = await fetch(`/api/paper/${paperId}/reviews`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setPaper({ ...paperData, reviews: reviewsData });
        } else {
          setPaper({ ...paperData, reviews: [] });
        }
      } else {
        setError("Failed to fetch paper details");
      }
    } catch (err) {
      setError("Error fetching paper details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorDecision = async () => {
    if (!editorDecision.comments.trim() || !editorDecision.feedbackToAuthor.trim()) {
      setError("Please provide both editor comments and feedback to author");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/paper/${paperId}/editor-decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision: editorDecision.decision,
          editorComments: editorDecision.comments,
          feedbackToAuthor: editorDecision.feedbackToAuthor,
          editorId: session?.user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setShowDecisionForm(false);
        fetchPaperDetails();
      } else {
        setError(data.error || "Failed to process decision");
      }
    } catch (err) {
      setError("An error occurred while processing your decision");
    } finally {
      setActionLoading(false);
    }
  };

  const getReviewStatusColor = (status: ReviewerStatus | null) => {
    switch (status) {
      case 'ACCEPTED_FOR_PUBLICATION':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED_FOR_PUBLICATION':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACCEPTED_FOR_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED_FOR_REVIEW':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallRecommendation = () => {
    if (!paper?.reviews || paper.reviews.length === 0) return null;
    
    const acceptedCount = paper.reviews.filter(r => r.reviewerStatus === 'ACCEPTED_FOR_PUBLICATION').length;
    const rejectedCount = paper.reviews.filter(r => r.reviewerStatus === 'REJECTED_FOR_PUBLICATION').length;
    const pendingCount = paper.reviews.filter(r => r.reviewerStatus === 'PENDING').length;
    
    return { acceptedCount, rejectedCount, pendingCount, total: paper.reviews.length };
  };

  const getAverageRating = () => {
    if (!paper?.reviews || paper.reviews.length === 0) return null;
    
    const ratingsWithValues = paper.reviews.filter(r => r.rating !== null);
    if (ratingsWithValues.length === 0) return null;
    
    const sum = ratingsWithValues.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / ratingsWithValues.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading paper and reviews...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Paper Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>The requested paper could not be found.</p>
            <Link href="/dashboard/editor" className="mt-4 inline-block">
              <Button>Back to Editor Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user?.userType !== "EDITOR" && session?.user?.userType !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Only editors can access this page.</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recommendation = getOverallRecommendation();
  const averageRating = getAverageRating();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard/editor" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor Dashboard
          </Link>
        </div>

        {/* Paper Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{paper.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Author: {paper.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{paper.author.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {new Date(paper.submissionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="text-center">{paper.status}</Badge>
                {averageRating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{averageRating}/10</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Paper File</h3>
                <a 
                  href={paper.filePath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Paper
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Summary */}
        {recommendation && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Review Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{recommendation.total}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{recommendation.acceptedCount}</div>
                  <div className="text-sm text-gray-600">Recommended</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{recommendation.rejectedCount}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{recommendation.pendingCount}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
              {averageRating && (
                <div className="mt-4 text-center">
                  <div className="text-lg font-semibold">Average Rating: {averageRating}/10</div>
                  <div className="flex justify-center items-center mt-2">
                    {[...Array(Math.floor(Number(averageRating)))].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    {Number(averageRating) % 1 !== 0 && (
                      <Star className="h-5 w-5 text-yellow-400 fill-current opacity-50" />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Summary */}
        {recommendation && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Review Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">{recommendation.acceptedCount}</span>
                  </div>
                  <p className="text-sm font-medium text-green-800">Recommend Acceptance</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsDown className="h-6 w-6 text-red-600" />
                    <span className="text-2xl font-bold text-red-700">{recommendation.rejectedCount}</span>
                  </div>
                  <p className="text-sm font-medium text-red-800">Recommend Rejection</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-6 w-6 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-700">{recommendation.pendingCount}</span>
                  </div>
                  <p className="text-sm font-medium text-yellow-800">Pending Reviews</p>
                </div>
              </div>
              
              {averageRating && (
                <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                    <span className="text-3xl font-bold text-blue-700">{averageRating}</span>
                    <span className="text-lg text-blue-600">/10</span>
                  </div>
                  <p className="text-sm font-medium text-blue-800">Average Rating</p>
                  <div className="flex justify-center items-center mt-2">
                    {[...Array(Math.floor(Number(averageRating)))].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    {Number(averageRating) % 1 !== 0 && (
                      <Star className="h-5 w-5 text-yellow-400 fill-current opacity-50" />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reviewer Comments ({paper.reviews.length} of 3 submitted)
              </CardTitle>
              {recommendation && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Overall Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{recommendation.acceptedCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">{recommendation.rejectedCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">{recommendation.pendingCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {paper.reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Reviews Submitted Yet</h3>
                <p>Waiting for all 3 reviewers to submit their reviews.</p>
                <div className="flex justify-center gap-4 mt-6">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex flex-col items-center gap-2">
                      <Avatar className="h-10 w-10 opacity-30">
                        <AvatarFallback className="bg-gray-300 text-gray-600">
                          R{num}
                        </AvatarFallback>
                      </Avatar>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Show all 3 reviewer slots */}
                {[1, 2, 3].map((reviewerNumber) => {
                  const review = paper.reviews[reviewerNumber - 1];
                  
                  if (review) {
                    return (
                      <div key={review.id} className="border rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={review.reviewer.profileImage || ""} />
                                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                                  {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="h-3 w-3" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{review.reviewer.name}</h4>
                              <p className="text-sm text-gray-600">{review.reviewer.email}</p>
                              {review.reviewer.affiliation && (
                                <p className="text-xs text-gray-500 font-medium">{review.reviewer.affiliation}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Reviewer {reviewerNumber}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Submitted: {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={`${getReviewStatusColor(review.reviewerStatus)} px-3 py-1`}>
                              {review.reviewerStatus || 'PENDING'}
                            </Badge>
                            {review.rating && (
                              <div className="flex items-center gap-1 justify-end">
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                                <span className="font-bold text-lg ml-1">{review.rating}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Review Comments
                            </h5>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {review.reviewText || "No comments provided."}
                            </p>
                          </div>

                          {review.correspondingFile && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Additional Files
                              </h5>
                              <Button variant="outline" size="sm" asChild>
                                <a href={review.correspondingFile} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Review File
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={`missing-${reviewerNumber}`} className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 opacity-50">
                            <AvatarFallback className="bg-gray-400 text-white">
                              R{reviewerNumber}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-500">Reviewer {reviewerNumber}</h4>
                            <p className="text-sm text-gray-400">Review not submitted yet</p>
                            <Badge variant="secondary" className="mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor Decision */}
        <Card>
          <CardHeader>
            <CardTitle>Editor Decision</CardTitle>
          </CardHeader>
          <CardContent>
            {!showDecisionForm ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  Make your editorial decision based on the reviews above.
                </p>
                <Button onClick={() => setShowDecisionForm(true)}>
                  Make Editorial Decision
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="decision">Decision</Label>
                  <select
                    id="decision"
                    value={editorDecision.decision}
                    onChange={(e) => setEditorDecision(prev => ({ 
                      ...prev, 
                      decision: e.target.value as 'ACCEPT' | 'REJECT' | 'REVISION_REQUIRED' 
                    }))}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="ACCEPT">Accept for Publication</option>
                    <option value="REVISION_REQUIRED">Revision Required</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="editorComments">Editor Comments (Internal)</Label>
                  <Textarea
                    id="editorComments"
                    value={editorDecision.comments}
                    onChange={(e) => setEditorDecision(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Internal comments about your decision..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="feedbackToAuthor">Feedback to Author</Label>
                  <Textarea
                    id="feedbackToAuthor"
                    value={editorDecision.feedbackToAuthor}
                    onChange={(e) => setEditorDecision(prev => ({ ...prev, feedbackToAuthor: e.target.value }))}
                    placeholder="Feedback that will be sent to the author..."
                    className="mt-2"
                    rows={6}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleEditorDecision}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    {actionLoading ? "Processing..." : "Submit Decision"}
                  </Button>
                  <Button
                    onClick={() => setShowDecisionForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        {error && (
          <Alert className="mt-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
