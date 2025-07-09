"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Eye,
  Calendar,
  User,
  Star,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface PaperWithDetails {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  rating?: number;
  coverLetterPath?: string;
  submissionDate: string;
  lastUpdated: string;
  acceptedDate?: string;
  status: string;
  reviewerStatus: string;
  editorStatus: string;
  contributors: any;
  pointOfContact: any;
  author?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string; email: string };
  editor?: { id: string; name: string; email: string };
  reviews?: Review[];
}

interface Review {
  id: string;
  reviewText: string;
  correspondingFile?: string;
  rating?: number;
  reviewerStatus?: string;
  editorStatus?: string;
  createdAt: string;
  reviewerId?: string;
  editorId?: string;
}

export default function PaperDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const paperId = params.paperId as string;
  
  const [paper, setPaper] = React.useState<PaperWithDetails | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (paperId) {
      fetchPaperDetails();
      fetchReviews();
    }
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      const response = await fetch(`/api/paper?paperId=${paperId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.papers && data.papers.length > 0) {
          const paperData = data.papers[0];
          // Parse JSON fields
          paperData.contributors = typeof paperData.contributors === 'string' 
            ? JSON.parse(paperData.contributors) 
            : paperData.contributors;
          paperData.pointOfContact = typeof paperData.pointOfContact === 'string' 
            ? JSON.parse(paperData.pointOfContact) 
            : paperData.pointOfContact;
          setPaper(paperData);
        }
      }
    } catch (error) {
      console.error("Error fetching paper:", error);
      toast.error("Failed to fetch paper details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/paper/review?paperId=${paperId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      UPLOAD: "outline",
      REVIEWER_ALLOCATION: "secondary",
      ON_REVIEW: "default",
      EDITOR_ALLOCATION: "secondary",
      ON_EDIT: "default",
      PUBLISH: "default",
      ACCEPTED: "default",
      REJECTED: "destructive",
      PENDING: "outline",
      ACCEPTED_FOR_PUBLICATION: "default",
      REJECTED_FOR_PUBLICATION: "destructive",
      ACCEPTED_FOR_REVIEW: "secondary",
      REJECTED_FOR_REVIEW: "destructive",
      ACCEPTED_FOR_EDIT: "secondary",
      REJECTED_FOR_EDIT: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, ' ')}</Badge>;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-semibold mb-2">Paper Not Found</h2>
        <p className="text-gray-600 mb-4">The requested paper could not be found.</p>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(paper.filePath, "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            View Paper
          </Button>
          {paper.coverLetterPath && (
            <Button variant="outline" onClick={() => window.open(paper.coverLetterPath, "_blank")}>
              <Download className="h-4 w-4 mr-2" />
              Cover Letter
            </Button>
          )}
        </div>
      </div>

      {/* Paper Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl">{paper.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(paper.status)}
                {getStatusBadge(paper.reviewerStatus)}
                {getStatusBadge(paper.editorStatus)}
              </div>
            </div>
            <div className="text-right">
              {renderStars(paper.rating)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Abstract</h4>
            <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {paper.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Submitted: {new Date(paper.submissionDate).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Last Updated: {new Date(paper.lastUpdated).toLocaleDateString()}
              </div>
              {paper.acceptedDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepted: {new Date(paper.acceptedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="contributors" className="w-full">
        <TabsList>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="contributors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Point of Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {paper.pointOfContact && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">{paper.pointOfContact.fullName}</span>
                    </div>
                    <p className="text-sm text-gray-600">{paper.pointOfContact.gmail}</p>
                    <p className="text-sm text-gray-600">{paper.pointOfContact.affiliation}</p>
                    {paper.pointOfContact.contactNumber && (
                      <p className="text-sm text-gray-600">{paper.pointOfContact.contactNumber}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paper.contributors && Array.isArray(paper.contributors) && paper.contributors.map((contributor: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">{contributor.fullName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{contributor.gmail}</p>
                      <p className="text-sm text-gray-600">{contributor.affiliation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Review Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Author</p>
                      <p className="text-sm text-gray-600">{paper.author?.name}</p>
                    </div>
                  </div>
                  <Badge variant="default">Submitted</Badge>
                </div>

                {paper.reviewer && (
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Reviewer</p>
                        <p className="text-sm text-gray-600">{paper.reviewer.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(paper.reviewerStatus)}
                  </div>
                )}

                {paper.editor && (
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Editor</p>
                        <p className="text-sm text-gray-600">{paper.editor.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(paper.editorStatus)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {review.reviewerId ? "Reviewer" : "Editor"} Feedback
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {review.rating && renderStars(review.rating)}
                        <Badge variant="outline">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                      
                      {review.correspondingFile && (
                        <Button variant="outline" size="sm" onClick={() => window.open(review.correspondingFile, "_blank")}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Attachment
                        </Button>
                      )}
                      
                      <div className="flex gap-2">
                        {review.reviewerStatus && getStatusBadge(review.reviewerStatus)}
                        {review.editorStatus && getStatusBadge(review.editorStatus)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No reviews available yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
