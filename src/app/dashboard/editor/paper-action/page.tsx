"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar,
  Globe,
  Award,
  AlertTriangle,
  Eye,
  Send
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { publishPaper } from "@/lib/Frontend-actions";

interface Paper {
  id: string;
  paperId: string;
  title: string;
  abstract: string;
  status: string;
  submissionDate: string;
  filePath: string;
  coverLetterPath?: string;
  keywords: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  contributors: Array<{
    fullName: string;
    email: string;
    affiliation: string;
  }>;
  pointOfContact: {
    fullName: string;
    email: string;
    affiliation: string;
  };
  reviews: Array<{
    id: string;
    reviewText: string;
    rating: number;
    reviewerStatus: string;
    reviewer: {
      name: string;
      email: string;
    };
  }>;
}

export default function PaperActionPage() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("paperId");
  
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  useEffect(() => {
    if (paperId) {
      fetchPaperDetails();
    }
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      const response = await fetch(`/api/paper/${paperId}`);
      const data = await response.json();
      if (data.success) {
        setPaper(data.paper);
      } else {
        toast.error("Paper not found");
      }
    } catch (error) {
      console.error("Error fetching paper:", error);
      toast.error("Failed to fetch paper details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string, feedback?: string) => {
    if (!paper) return;

    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/paper/${paper.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          feedback: feedback || undefined
        }),
      });

      if (response.ok) {
        toast.success(`Paper ${newStatus.toLowerCase()} successfully`);
        fetchPaperDetails(); // Refresh paper data
        setIsActionDialogOpen(false);
        setFeedback("");
        setSelectedAction("");
      } else {
        toast.error(`Failed to ${newStatus.toLowerCase()} paper`);
      }
    } catch (error) {
      console.error("Error updating paper status:", error);
      toast.error("Error updating paper status");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!paper) return;

    try {
      const response = await publishPaper(paper.id);
      if (response.success) {
        toast.success("Paper published successfully");
        fetchPaperDetails(); // Refresh paper data
      } else {
        toast.error("Failed to publish paper");
      }
    } catch (error) {
      console.error("Error publishing paper:", error);
      toast.error("Error publishing paper");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      case "PUBLISH": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ON_REVIEW": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REVIEWER_ALLOCATION": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvailableActions = () => {
    if (!paper) return [];

    const actions = [];
    
    switch (paper.status) {
      case "UPLOAD":
      case "REVIEWER_ALLOCATION":
        actions.push(
          { id: "REVIEWER_ALLOCATION", label: "Move to Reviewer Allocation", icon: User },
          { id: "ON_REVIEW", label: "Send for Review", icon: FileText }
        );
        break;
      case "ON_REVIEW":
        actions.push(
          { id: "EDITOR_DECISION", label: "Move to Editor Decision", icon: Edit },
        );
        break;
      case "EDITOR_DECISION":
        actions.push(
          { id: "ACCEPTED", label: "Accept Paper", icon: CheckCircle },
          { id: "REJECTED", label: "Reject Paper", icon: XCircle }
        );
        break;
      case "ACCEPTED":
        actions.push(
          { id: "PUBLISH", label: "Publish Paper", icon: Globe }
        );
        break;
    }

    return actions;
  };

  const openActionDialog = (actionId: string) => {
    setSelectedAction(actionId);
    setIsActionDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading paper details...</div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Paper Not Found</h2>
          <Link href="/dashboard/editor">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paper Actions</h1>
            <p className="text-gray-600 mt-2">
              Manage and perform actions on the selected paper
            </p>
          </div>
          <Link href="/dashboard/editor">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Paper Details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{paper.title}</CardTitle>
              <CardDescription className="mt-2">
                Paper ID: <Badge variant="outline">{paper.paperId}</Badge>
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(paper.status)} border`}>
              {paper.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Author</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{paper.author.name} ({paper.author.email})</span>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Submission Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(paper.submissionDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {paper.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Abstract</Label>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {paper.abstract.length > 200 
                      ? `${paper.abstract.substring(0, 200)}...` 
                      : paper.abstract}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={paper.filePath} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      View Paper
                    </Link>
                  </Button>
                  {paper.coverLetterPath && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={paper.coverLetterPath} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        Cover Letter
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Summary */}
      {paper.reviews && paper.reviews.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reviews Summary</CardTitle>
            <CardDescription>
              {paper.reviews.length} review(s) submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paper.reviews.map((review, idx) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{review.reviewer.name}</div>
                    <div className="flex items-center gap-2">
                      {review.rating && (
                        <Badge variant="outline">
                          <Award className="w-3 h-3 mr-1" />
                          {review.rating}/5
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          review.reviewerStatus === "ACCEPTED_FOR_PUBLICATION" ? "default" :
                          review.reviewerStatus === "REJECTED_FOR_PUBLICATION" ? "destructive" :
                          "secondary"
                        }
                      >
                        {review.reviewerStatus}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {review.reviewText.length > 150 
                      ? `${review.reviewText.substring(0, 150)}...` 
                      : review.reviewText}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
          <CardDescription>
            Perform editorial actions on this paper
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAvailableActions().map((action) => (
              <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <action.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{action.label}</h3>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3" 
                    onClick={() => {
                      if (action.id === "PUBLISH") {
                        handlePublish();
                      } else {
                        openActionDialog(action.id);
                      }
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : action.label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {getAvailableActions().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Actions Available</h3>
              <p>No actions can be performed on this paper at its current status.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              You are about to change the paper status to: 
              <Badge className="ml-2">{selectedAction}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(selectedAction === "ACCEPTED" || selectedAction === "REJECTED") && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="feedback" className="text-right mt-2">
                  Feedback
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="col-span-3"
                  placeholder={`Provide feedback for the ${selectedAction.toLowerCase()} decision...`}
                  rows={4}
                />
              </div>
            )}
            <div className="text-sm text-gray-600">
              This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Update the paper status to {selectedAction}</li>
                <li>Send notification emails to the author and contributors</li>
                {selectedAction === "ACCEPTED" && <li>Make the paper eligible for publication</li>}
                {selectedAction === "REJECTED" && <li>Close the review process for this paper</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleStatusUpdate(selectedAction, feedback)}
              disabled={actionLoading}
              className={
                selectedAction === "ACCEPTED" ? "bg-green-600 hover:bg-green-700" :
                selectedAction === "REJECTED" ? "bg-red-600 hover:bg-red-700" :
                ""
              }
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Confirm {selectedAction}
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}