"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  FileText,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Building,
  Eye,
  Share,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  submissionDate: string;
  acceptedDate?: string;
  status: string;
  filePath: string;
  coverLetterPath?: string;
  rating?: number;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  contributors?: any[];
  pointOfContact?: any;
  reviews?: any[];
}

export default function PaperDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);
  const [pointOfContact, setPointOfContact] = useState<any>(null);

  // Fetch paper details
  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/paper/${id}`);
      const paperData = response.data.paper;

      setPaper(paperData);

      // Parse JSON fields
      if (paperData.contributors) {
        try {
          const contributorsData =
            typeof paperData.contributors === "string"
              ? JSON.parse(paperData.contributors)
              : paperData.contributors;
          setContributors(
            Array.isArray(contributorsData) ? contributorsData : []
          );
        } catch (e) {
          console.error("Error parsing contributors:", e);
          setContributors([]);
        }
      }

      if (paperData.pointOfContact) {
        try {
          const pocData =
            typeof paperData.pointOfContact === "string"
              ? JSON.parse(paperData.pointOfContact)
              : paperData.pointOfContact;
          setPointOfContact(pocData);
        } catch (e) {
          console.error("Error parsing point of contact:", e);
          setPointOfContact(null);
        }
      }
    } catch (error) {
      console.error("Error fetching paper details:", error);
      toast.error("Failed to load paper details");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Share paper
  const sharePaper = () => {
    if (navigator.share) {
      navigator.share({
        title: paper?.title,
        text: paper?.abstract,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (id) {
      fetchPaperDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-8 ">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Paper Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The research paper you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.push("/paper")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden scroll-smooth">
      <MemoizedNavbar />
      <div className="container mx-auto px-4 py-8 w-full lg:pt-36 md:pt-40 pt-36">
        {/* Header */}
        <div className="my-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4 leading-tight">
                {paper.title}
              </h1>

              {/* Paper Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {paper.author && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 text-base"
                  >
                    <User className="h-3 w-3" />
                    {paper.author.name}
                  </Badge>
                )}

                <Badge variant="outline" className="flex items-center gap-1 text-base">
                  <Calendar className="h-3 w-3" />
                  Submitted: {formatDate(paper.submissionDate)}
                </Badge>

                {paper.acceptedDate && (
                  <Badge variant="default" className="flex items-center gap-1 text-base">
                    <Calendar className="h-3 w-3" />
                    Published: {formatDate(paper.acceptedDate)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button variant="outline" onClick={sharePaper}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => window.open(paper.filePath, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abstract */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="h-5 w-5" />
                  Abstract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-justify">
                  {paper.abstract}
                </p>
              </CardContent>
            </Card>

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Tag className="h-5 w-5" />
                    Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-lg">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contributors */}
            {contributors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <User className="h-5 w-5" />
                    Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contributors.map((contributor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          {contributor.fullName}
                        </h4>
                        <div className="flex flex-row justify-around gap-2 text-base text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {contributor.email}
                          </div>
                         
                          {contributor.affiliation && (
                            <div className="flex items-center gap-2 ">
                              <Building className="h-4 w-4" />
                              {contributor.affiliation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => window.open(paper.filePath, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Paper
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = paper.filePath;
                    link.download = `${paper.title}.pdf`;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>

             
              </CardContent>
            </Card>

            {/* Paper Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Paper Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-base font-medium">Status</Label>
                  <p className="text-base text-muted-foreground">
                    <Badge
                      variant={
                        paper.status === "PUBLISH" ? "default" : "secondary"
                      }
                    >
                      {paper.status}
                    </Badge>
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Submission Date</Label>
                  <p className="text-base text-muted-foreground">
                    {formatDate(paper.submissionDate)}
                  </p>
                </div>

                {paper.acceptedDate && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-medium">
                        Publication Date
                      </Label>
                      <p className="text-base text-muted-foreground">
                        {formatDate(paper.acceptedDate)}
                      </p>
                    </div>
                  </>
                )}

                {paper.rating && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-medium">Rating</Label>
                      <p className="text-base text-muted-foreground">
                        {paper.rating}/5
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Point of Contact */}
            {/* {pointOfContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Point of Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-base font-medium">Name</Label>
                      <p className="text-base text-muted-foreground">
                        {pointOfContact.fullName}
                      </p>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Email</Label>
                      <p className="text-base text-muted-foreground">
                        <a
                          href={`mailto:${pointOfContact.email}`}
                          className="hover:underline"
                        >
                          {pointOfContact.email}
                        </a>
                      </p>
                    </div>

                    {pointOfContact.affiliation && (
                      <div>
                        <Label className="text-base font-medium">
                          Affiliation
                        </Label>
                        <p className="text-base text-muted-foreground">
                          {pointOfContact.affiliation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )} */}
          </div>
        </div>
      </div>
      <MemoizedFooter />
    </div>
  );
}
