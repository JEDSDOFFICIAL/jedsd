"use client";

import React from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResearchPaper, PaperReview, User } from "@prisma/client";
import {
  FileText,
  Eye,
  Users,
  ArrowRight,
  UserIcon,
  Tag,
  Calendar,
  AlertCircle,
  LoaderCircle,
  PaperclipIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { AuthorOrContact } from "@/types/dataTypes";

// Extended interface to include relations
interface PaperReviewWithReviewer extends PaperReview {
  reviewer: User;
}

interface PaperWithRelations {
  id: string;
  title: string;
  abstract: string;
  filePath: string;
  keywords: string[];
  rating: number | null;
  coverLetterPath: string | null;
  submissionDate: Date;
  lastUpdated: Date;
  acceptedDate: Date | null;
  status: string;
  authorId: string | null;
  contributors: AuthorOrContact[];
  pointOfContact: AuthorOrContact;
  reviews: PaperReviewWithReviewer[];
  author: User;
}

type PaperDetailsDialogProps = {
  paperId: string;
  trigger: React.ReactNode;
};

export function PaperDetailsDialog({
  paperId,
  trigger,
}: PaperDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [paperDetails, setPaperDetails] =
    React.useState<PaperWithRelations | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPaperDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/paper/${paperId}`);
      console.log("API Response:", response.data.paper);
      setPaperDetails(response.data.paper);
    } catch (error) {
      console.error("Error fetching paper details:", error);
      setError("Failed to load paper details");
      setPaperDetails(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && paperId) fetchPaperDetails();
  }, [open, paperId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-6xl max-w-screen bg-blue-100/30 backdrop-blur-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5 text-blue-600" />
            Paper Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 h-[70vh] scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <LoaderCircle className="animate-spin h-8 w-8 text-blue-600" />
              <p className="text-muted-foreground">Loading paper details...</p>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          ) : paperDetails ? (
            <div className="space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg leading-relaxed font-semibold">
                    <span className="flex items-center">
                      <FileText className="h-5 w-5 inline mr-2 text-green-600" />
                      Title:
                    </span>
                    {paperDetails.title}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Abstract */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="h-4 w-4" />
                    Abstract
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {paperDetails.abstract}
                  </p>
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Tag className="h-4 w-4" />
                      Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {paperDetails.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        paperDetails.status === "PUBLISHED"
                          ? "default"
                          : "secondary"
                      }
                      className="text-sm px-3 py-1"
                    >
                      {paperDetails.status}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Submission Date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Calendar className="h-4 w-4" />
                      Submission Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(paperDetails.submissionDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <UserIcon className="h-4 w-4" />
                    Point of Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {paperDetails.pointOfContact.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {paperDetails.pointOfContact.email}
                    </p>
                    {paperDetails.pointOfContact.affiliation && (
                      <p className="text-sm text-muted-foreground">
                        {paperDetails.pointOfContact.affiliation}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contributors */}
              {paperDetails.contributors &&
                paperDetails.contributors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <UserIcon className="h-4 w-4" />
                        Contributors ({paperDetails.contributors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paperDetails.contributors.map((contributor, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg bg-muted/30"
                          >
                            <p className="font-medium text-sm">
                              {contributor.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contributor.email}
                            </p>
                            {contributor.affiliation && (
                              <p className="text-xs text-muted-foreground">
                                {contributor.affiliation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-amber-800">No paper details available.</p>
              </CardContent>
            </Card>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center gap-3 px-6 pb-6">
          {paperDetails && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Main Document Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(paperDetails.filePath, "_blank")}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Read Manuscript
                </Button>
                
                {paperDetails.coverLetterPath && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(paperDetails.coverLetterPath!, "_blank")}
                    className="flex items-center gap-2"
                  >
                    <PaperclipIcon className="h-4 w-4" />
                    Read Cover Letter
                  </Button>
                )}
              </div>

              {/* Editorial Actions */}
              <div className="flex gap-2">
                <Link href={`/dashboard/editor/paper-action?paperId=${paperDetails.id}`}>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Paper Actions
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}