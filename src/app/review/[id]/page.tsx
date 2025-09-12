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
import { CheckCircle, XCircle, FileText, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  submissionDate: string;
  status: string;
  reviewerStatus: string;
  author: {
    name: string;
    email: string;
  };
}

export default function ReviewerActionPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const paperId = params?.id as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [correspondingFile, setCorrespondingFile] = useState("");

  useEffect(() => {
    if (paperId) {
      fetchPaper();
    }
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/paper/${paperId}`);
      if (response.ok) {
        const data = await response.json();
        setPaper(data);
      } else {
        setError("Failed to fetch paper details");
      }
    } catch (err) {
      setError("Error fetching paper details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!reviewText.trim()) {
      setError("Please provide review text");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/paper/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperId,
          reviewerId: session?.user?.id,
          reviewText,
          rating,
          reviewerStatus: action === "accept" ? "ACCEPTED_FOR_PUBLICATION" : "REJECTED_FOR_PUBLICATION",
          correspondingFile: correspondingFile || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Refresh paper data
        fetchPaper();
      } else {
        setError(data.error || "Failed to process action");
      }
    } catch (err) {
      setError("An error occurred while processing your action");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading paper details...</div>
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
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session?.user?.userType === "USER") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Only reviewers can access this page.</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{paper.title}</CardTitle>
                <p className="text-gray-600">Author: {paper.author.name}</p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(paper.submissionDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{paper.status}</Badge>
                <Badge variant={paper.reviewerStatus === "PENDING" ? "secondary" : "default"}>
                  {paper.reviewerStatus}
                </Badge>
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

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="reviewText">Review Comments *</Label>
              <Textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Enter your detailed review comments..."
                className="mt-2"
                rows={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="rating">Rating (1-10)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-20"
                />
                <div className="flex items-center">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  {[...Array(10 - rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="correspondingFile">Corresponding File (Optional)</Label>
              <Input
                id="correspondingFile"
                type="url"
                value={correspondingFile}
                onChange={(e) => setCorrespondingFile(e.target.value)}
                placeholder="URL to additional review file..."
                className="mt-2"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => handleAction("ACCEPT_REVIEW")}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept for Review
              </Button>
              
              <Button
                onClick={() => handleAction("REJECT_REVIEW")}
                disabled={actionLoading}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Review
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Publication Decision</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleAction("ACCEPT_PUBLICATION")}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Recommend for Publication
                </Button>
                
                <Button
                  onClick={() => handleAction("REJECT_PUBLICATION")}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject for Publication
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
