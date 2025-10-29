"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, UserCheck, UserX, Users } from "lucide-react";
import { fetchReviewer, reviewerAllocation, reassignReviewer } from "@/lib/Frontend-actions";
import toast from "react-hot-toast";
import { User } from "@prisma/client";

interface PaperReviewWithReviewer {
  id: string;
  reviewerId: string;
  reviewerStatus: string;
  reviewer: User;
}

interface ReviewerAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperId: string;
  paperTitle: string;
  currentReviewers: PaperReviewWithReviewer[];
  onSuccess: () => void;
  mode: "assign" | "reassign";
  reviewerToReassign?: PaperReviewWithReviewer;
}

export default function ReviewerAssignmentDialog({
  open,
  onOpenChange,
  paperId,
  paperTitle,
  currentReviewers,
  onSuccess,
  mode,
  reviewerToReassign,
}: ReviewerAssignmentDialogProps) {
  const [availableReviewers, setAvailableReviewers] = useState<User[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingReviewers, setFetchingReviewers] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableReviewers();
    }
  }, [open]);

  const fetchAvailableReviewers = async () => {
    try {
      setFetchingReviewers(true);
      const response = await fetchReviewer();
      if (response && Array.isArray(response)) {
        // Filter out currently assigned reviewers
        const currentReviewerIds = currentReviewers.map(r => r.reviewerId);
        const available = response.filter(
          (reviewer: User) => !currentReviewerIds.includes(reviewer.id)
        );
        setAvailableReviewers(available);
      }
    } catch (error) {
      console.error("Error fetching reviewers:", error);
      toast.error("Failed to fetch available reviewers");
    } finally {
      setFetchingReviewers(false);
    }
  };

  const filteredReviewers = availableReviewers.filter(reviewer =>
    reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reviewer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reviewer.areaOfInterest.some(area => 
      area.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerId)) {
        return prev.filter(id => id !== reviewerId);
      } else {
        const maxReviewers = mode === "assign" ? (3 - currentReviewers.length) : 1;
        if (prev.length < maxReviewers) {
          return [...prev, reviewerId];
        } else {
          toast.error(`You can only select ${maxReviewers} reviewer(s)`);
          return prev;
        }
      }
    });
  };

  const handleAssign = async () => {
    if (selectedReviewers.length === 0) {
      toast.error("Please select at least one reviewer");
      return;
    }

    try {
      setLoading(true);
      
      if (mode === "assign") {
        await reviewerAllocation(paperId, selectedReviewers, onSuccess);
        toast.success("Reviewers assigned successfully");
      } else if (mode === "reassign" && reviewerToReassign) {
        // For reassignment, we only allow one reviewer selection
        await reassignReviewer(paperId, reviewerToReassign.reviewerId, selectedReviewers[0]);
        toast.success("Reviewer reassigned successfully");
        onSuccess();
      }
      
      onOpenChange(false);
      setSelectedReviewers([]);
    } catch (error) {
      console.error("Error assigning reviewers:", error);
      toast.error("Failed to assign reviewers");
    } finally {
      setLoading(false);
    }
  };

  const getMaxReviewers = () => {
    return mode === "assign" ? (3 - currentReviewers.length) : 1;
  };

  const getDialogTitle = () => {
    if (mode === "assign") {
      return `Assign Reviewers (${currentReviewers.length}/3 assigned)`;
    }
    return `Reassign Reviewer: ${reviewerToReassign?.reviewer.name}`;
  };

  const getDialogDescription = () => {
    if (mode === "assign") {
      return `Select up to ${getMaxReviewers()} reviewer(s) for "${paperTitle}"`;
    }
    return `Select a new reviewer to replace ${reviewerToReassign?.reviewer.name} for "${paperTitle}"`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Current Reviewers Section */}
        {currentReviewers.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Reviewers</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentReviewers.map((review) => (
                <div key={review.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{review.reviewer.name}</p>
                      <p className="text-xs text-gray-500">{review.reviewer.email}</p>
                    </div>
                    <Badge 
                      variant={
                        review.reviewerStatus === 'ACCEPTED_FOR_REVIEW' ? 'default' :
                        review.reviewerStatus === 'REJECTED_FOR_REVIEW' ? 'destructive' :
                        review.reviewerStatus === 'PENDING' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {review.reviewerStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Search Bar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Available Reviewers</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or area of interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Reviewers List */}
        <ScrollArea className="h-64 pr-4">
          {fetchingReviewers ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading reviewers...</p>
              </div>
            </div>
          ) : filteredReviewers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <UserX className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No available reviewers found</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviewers.map((reviewer) => (
                <div
                  key={reviewer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedReviewers.includes(reviewer.id)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleReviewerToggle(reviewer.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedReviewers.includes(reviewer.id)}
                        onChange={() => handleReviewerToggle(reviewer.id)}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{reviewer.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{reviewer.email}</p>
                        {reviewer.affiliation && (
                          <p className="text-xs text-gray-600 mb-2">{reviewer.affiliation}</p>
                        )}
                        {reviewer.areaOfInterest.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {reviewer.areaOfInterest.slice(0, 3).map((area, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {reviewer.areaOfInterest.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{reviewer.areaOfInterest.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500">
              {selectedReviewers.length} of {getMaxReviewers()} reviewer(s) selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={loading || selectedReviewers.length === 0}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "assign" ? "Assigning..." : "Reassigning..."}
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    {mode === "assign" ? "Assign Reviewers" : "Reassign Reviewer"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}