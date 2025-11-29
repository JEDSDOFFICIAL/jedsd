"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Head from "next/head";
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
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

const MemoizedNavbar = React.memo(Navbar);
const MemoizedFooter = React.memo(Footer);
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
import Link from "next/link";

interface ResearchPaper {
  id: string;
  paperId: string;
  doi?: string;
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

  // Update metadata dynamically
  useEffect(() => {
    if (paper) {
      // Update document title
      document.title = `${paper.title} - JEDSD`;

      // Update meta tags
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', paper.abstract.substring(0, 160) + '...');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = paper.abstract.substring(0, 160) + '...';
        document.head.appendChild(meta);
      }

      // Open Graph meta tags for social sharing
      const updateOrCreateMetaTag = (property: string, content: string) => {
        const metaTag = document.querySelector(`meta[property="${property}"]`);
        if (metaTag) {
          metaTag.setAttribute('content', content);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('property', property);
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        }
      };

      updateOrCreateMetaTag('og:title', paper.title);
      updateOrCreateMetaTag('og:description', paper.abstract.substring(0, 200) + '...');
      updateOrCreateMetaTag('og:type', 'article');
      updateOrCreateMetaTag('og:url', window.location.href);
      if (paper.doi) {
        updateOrCreateMetaTag('og:article:published_time', paper.acceptedDate || paper.submissionDate);
      }

      // Twitter Card meta tags
      const updateOrCreateTwitterTag = (name: string, content: string) => {
        const metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag) {
          metaTag.setAttribute('content', content);
        } else {
          const meta = document.createElement('meta');
          meta.setAttribute('name', name);
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        }
      };

      updateOrCreateTwitterTag('twitter:card', 'summary_large_image');
      updateOrCreateTwitterTag('twitter:title', paper.title);
      updateOrCreateTwitterTag('twitter:description', paper.abstract.substring(0, 200) + '...');
    } else if (!loading) {
      // Clear metadata when paper is not found
      document.title = 'Paper Not Found - JEDSD';
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', '');
      }

      // Clear Open Graph tags
      const clearMetaTag = (property: string) => {
        const metaTag = document.querySelector(`meta[property="${property}"]`);
        if (metaTag) {
          metaTag.setAttribute('content', '');
        }
      };

      clearMetaTag('og:title');
      clearMetaTag('og:description');
      clearMetaTag('og:type');
      clearMetaTag('og:url');
      clearMetaTag('og:article:published_time');

      // Clear Twitter Card tags
      const clearTwitterTag = (name: string) => {
        const metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag) {
          metaTag.setAttribute('content', '');
        }
      };

      clearTwitterTag('twitter:card');
      clearTwitterTag('twitter:title');
      clearTwitterTag('twitter:description');
    }
  }, [paper, loading]);

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

      <div className="container mx-auto px-4 w-full">
        {/* Header */}
        <div className="my-6">
         
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
                {paper.doi && (
                  <Link href={paper.doi} target="_blank" rel="noopener noreferrer">
                    <Badge variant="outline" className="flex items-center gap-1 text-base  hover:bg-green-300 cursor-pointer hover:text-white hover:underline duration-150 hover:border border-green-700">
                      <ExternalLink className="h-3 w-3" />
                    {paper.doi}
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button variant="outline" onClick={sharePaper}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                  
                  onClick={() => window.open(paper.filePath, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Paper
                </Button>

                <Button
                  variant="outline"
                  
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

            {/* PDF Preview */}
           
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Authors */}
            {contributors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Authors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contributors.map((contributor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="font-semibold text-sm">
                        {contributor.fullName}
                      </div>
                      {contributor.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <a
                            href={`mailto:${contributor.email}`}
                            className="hover:text-primary hover:underline break-all"
                          >
                            {contributor.email}
                          </a>
                        </div>
                      )}
                      {contributor.affiliation && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Building className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{contributor.affiliation}</span>
                        </div>
                      )}
                      {index < contributors.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            

            {/* Paper Information */}
           

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

         {paper.filePath && (
              <Card className="w-full my-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <FileText className="h-5 w-5" />
                    Paper Preview
                  </CardTitle>
                  <CardDescription>
                    Viewing first 3 pages - Open full paper to see all pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <iframe
                      src={`${paper.filePath}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full md:h-[600px] lg:h-[800px] h-[400px] border rounded-lg"
                      title="PDF Preview"
                    />
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => window.open(paper.filePath, "_blank")}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Full Paper
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        {/* Authors Section - Full Width */}
       
      </div>

    </div>
  );
}
