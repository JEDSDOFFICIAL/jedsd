"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResearchPaper } from "@prisma/client";
import { FileText, Calendar, Star, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function MyPapersPage() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPapers = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/paper/user-papers?email=${session.user.email}`);
        setPapers(response.data.papers || []);
      } catch (err) {
        console.error("Error fetching papers:", err);
        setError("Failed to load your papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [session?.user?.email]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPLOAD":
        return "bg-blue-100 text-blue-800";
      case "REVIEWER_ALLOCATION":
        return "bg-yellow-100 text-yellow-800";
      case "ON_REVIEW":
        return "bg-orange-100 text-orange-800";
      case "EDITOR_DECISION":
        return "bg-purple-100 text-purple-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PUBLISH":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "UPLOAD":
        return "Uploaded";
      case "REVIEWER_ALLOCATION":
        return "Reviewer Allocation";
      case "ON_REVIEW":
        return "Under Review";
      case "EDITOR_DECISION":
        return "Editor Decision";
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "PUBLISH":
        return "Published";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Papers</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your submitted manuscripts
        </p>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No papers submitted yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven&apos;t submitted any manuscripts yet. Start by uploading your first paper.
            </p>
            <Link href="/dashboard/paper/upload">
              <Button>
                Upload Your First Paper
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {papers.map((paper) => (
            <Card key={paper.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {paper.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {paper.abstract}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(paper.status)}>
                    {getStatusLabel(paper.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {format(new Date(paper.submissionDate), "MMM dd, yyyy")}</span>
                  </div>
                  {paper.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>Rating: {paper.rating}/10</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Paper ID: {paper.paperId}</span>
                  </div>
                </div>

                {paper.keywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {paper.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/dashboard/paper/${paper.paperId}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {paper.status === "UPLOAD" && (
                    <Link href={`/dashboard/paper/${paper.paperId}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
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