"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperReview, ResearchPaper, User } from "@prisma/client";
import { 
  FileSignature, 
  Star, 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Download,
  MessageSquare
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";

interface ReviewWithDetails extends PaperReview {
  paper: ResearchPaper;
  reviewer: User;
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        // Get all papers first
        const papersResponse = await axios.get("/api/paper");
        const papers = papersResponse.data.papers || [];
        
        // Collect all reviews from papers that have reviews with text
        const allReviews: ReviewWithDetails[] = [];
        for (const paper of papers) {
          if (paper.reviews && paper.reviews.length > 0) {
            for (const review of paper.reviews) {
              if (review.reviewText && review.reviewText.trim() !== "") {
                allReviews.push({
                  ...review,
                  paper: paper,
                  reviewer: review.reviewer
                });
              }
            }
          }
        }
        
        setReviews(allReviews);
        setFilteredReviews(allReviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [session?.user?.email]);

  useEffect(() => {
    const filtered = reviews.filter(review =>
      review.paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.paper.paperId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReviews(filtered);
  }, [searchTerm, reviews]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ACCEPTED_FOR_PUBLICATION":
        return "bg-green-100 text-green-800";
      case "REJECTED_FOR_PUBLICATION":
        return "bg-red-100 text-red-800";
      case "MINOR_REVISION":
        return "bg-blue-100 text-blue-800";
      case "MAJOR_REVISION":
        return "bg-orange-100 text-orange-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "ACCEPTED_FOR_PUBLICATION":
        return "Accept";
      case "REJECTED_FOR_PUBLICATION":
        return "Reject";
      case "MINOR_REVISION":
        return "Minor Revision";
      case "MAJOR_REVISION":
        return "Major Revision";
      case "PENDING":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-gray-500";
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    if (rating >= 4) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSignature className="h-8 w-8" />
          Reviews
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage all manuscript reviews
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reviews by paper title, reviewer, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({filteredReviews.length})</CardTitle>
          <CardDescription>
            Complete overview of manuscript reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No reviews match your search criteria" : "No reviews have been submitted yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paper</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium truncate">{review.paper.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {review.paper.paperId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{review.reviewer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.reviewer.affiliation}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${getRatingColor(review.rating!)}`} />
                        <span className={`font-medium ${getRatingColor(review.rating!)}`}>
                          {review.rating || "N/A"}/10
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(review.reviewerStatus!)}>
                        {getStatusLabel(review.reviewerStatus!)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(review.createdAt), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/review/editor/${review.paper.paperId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {review.correspondingFile && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileSignature className="h-8 w-8 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="bg-green-100 text-green-800 h-8 w-8 rounded-full flex items-center justify-center p-0">
                ✓
              </Badge>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.reviewerStatus === "ACCEPTED_FOR_PUBLICATION").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="bg-red-100 text-red-800 h-8 w-8 rounded-full flex items-center justify-center p-0">
                ✗
              </Badge>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.reviewerStatus === "REJECTED_FOR_PUBLICATION").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}