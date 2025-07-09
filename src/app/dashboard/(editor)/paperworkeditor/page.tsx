"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { ResearchPaper, EditorStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function EditorPaperwork() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [editorStatus, setEditorStatus] = useState<EditorStatus>("PENDING");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPapers();
    }
  }, [session]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/paper?editorId=${session?.user?.id}&status=ON_EDIT`);
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedPaper || !reviewText.trim()) {
      toast.error("Please provide review text");
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit the review
      await axios.post("/api/paper/review", {
        paperId: selectedPaper.id,
        reviewText,
        editorStatus,
        editorId: session?.user?.id,
      });

      toast.success("Review submitted successfully");
      setSelectedPaper(null);
      setReviewText("");
      setEditorStatus("PENDING");
      fetchPapers();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED_FOR_PUBLICATION": return "bg-green-100 text-green-800";
      case "REJECTED_FOR_PUBLICATION": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "ACCEPTED_FOR_PUBLICATION": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED_FOR_PUBLICATION": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editor Dashboard</h1>
        <p className="text-gray-600">Review and edit papers assigned to you</p>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No papers assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don&apos;t have any papers assigned for editing yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {papers.map((paper) => (
            <Card key={paper.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{paper.title}</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(paper.editorStatus)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(paper.editorStatus)}
                          <span>{paper.editorStatus.replace('_', ' ')}</span>
                        </div>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Submitted: {new Date(paper.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{paper.abstract}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {paper.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/paper/${paper.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" asChild>
                      <a href={paper.filePath} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        Download Paper
                      </a>
                    </Button>
                  </div>

                  {paper.editorStatus === "PENDING" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedPaper(paper)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Submit Edit Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Submit Editor Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Paper Title:</h3>
                            <p className="text-gray-700">{selectedPaper?.title}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Review Comments *
                            </label>
                            <Textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Provide your detailed review and editing suggestions..."
                              rows={6}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Editor Decision *
                            </label>
                            <Select 
                              value={editorStatus} 
                              onValueChange={(value: EditorStatus) => setEditorStatus(value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACCEPTED_FOR_PUBLICATION">Accept for Publication</SelectItem>
                                <SelectItem value="REJECTED_FOR_PUBLICATION">Reject for Publication</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedPaper(null);
                                setReviewText("");
                                setEditorStatus("PENDING");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitReview}
                              disabled={submitting || !reviewText.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {submitting ? "Submitting..." : "Submit Review"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
