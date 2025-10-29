"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@prisma/client";
import { 
  UserCheck, 
  Mail, 
  GraduationCap, 
  Search, 
  Plus, 
  Filter,
  MoreHorizontal,
  Users
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface ReviewerStats {
  activeReviews: number;
  completedReviews: number;
  averageRating: number;
  expertise: string[];
}

interface ReviewerWithStats extends User {
  stats: ReviewerStats;
}

export default function ReviewerManagementPage() {
  const { data: session } = useSession();
  const [reviewers, setReviewers] = useState<ReviewerWithStats[]>([]);
  const [filteredReviewers, setFilteredReviewers] = useState<ReviewerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReviewers = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get("/api/user/reviewer");
        
        // API now returns reviewers with stats
        setReviewers(response.data || []);
        setFilteredReviewers(response.data || []);
      } catch (err) {
        console.error("Error fetching reviewers:", err);
        setError("Failed to load reviewers");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewers();
  }, [session?.user?.email]);

  useEffect(() => {
    const filtered = reviewers.filter(reviewer =>
      reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.affiliation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.areaOfInterest.some(interest => 
        interest.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredReviewers(filtered);
  }, [searchTerm, reviewers]);

  const inviteReviewer = async (email: string) => {
    try {
      await axios.post("/api/editor/invite-reviewer", { email });
      toast.success("Reviewer invitation sent successfully");
    } catch (err) {
      console.error("Error inviting reviewer:", err);
      toast.error("Failed to send reviewer invitation");
    }
  };

  const deactivateReviewer = async (reviewerId: string) => {
    try {
      await axios.patch(`/api/editor/reviewers/${reviewerId}/deactivate`);
      toast.success("Reviewer deactivated successfully");
      // Refresh the list
      window.location.reload();
    } catch (err) {
      console.error("Error deactivating reviewer:", err);
      toast.error("Failed to deactivate reviewer");
    }
  };

  const getWorkloadBadge = (activeReviews: number) => {
    if (activeReviews === 0) return <Badge variant="secondary">Available</Badge>;
    if (activeReviews <= 2) return <Badge className="bg-green-100 text-green-800">Light Load</Badge>;
    if (activeReviews <= 4) return <Badge className="bg-yellow-100 text-yellow-800">Moderate Load</Badge>;
    return <Badge className="bg-red-100 text-red-800">Heavy Load</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviewers...</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Reviewer Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor your pool of reviewers
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Invite Reviewer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reviewers by name, email, affiliation, or expertise..."
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

      {/* Reviewers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewers ({filteredReviewers.length})</CardTitle>
          <CardDescription>
            Overview of all reviewers in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReviewers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviewers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No reviewers match your search criteria" : "Start by inviting reviewers to your platform"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviewers.map((reviewer) => (
                  <TableRow key={reviewer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{reviewer.name}</div>
                          <div className="text-sm text-muted-foreground">{reviewer.email}</div>
                          {reviewer.affiliation && (
                            <div className="text-xs text-muted-foreground">{reviewer.affiliation}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {reviewer.areaOfInterest.slice(0, 3).map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {reviewer.areaOfInterest.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{reviewer.areaOfInterest.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getWorkloadBadge(reviewer.stats.activeReviews)}
                        <div className="text-xs text-muted-foreground">
                          {reviewer.stats.activeReviews} active
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {reviewer.stats.completedReviews} reviews
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {reviewer.stats.averageRating.toFixed(1)}/10
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(reviewer.updatedAt), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <GraduationCap className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deactivateReviewer(reviewer.id)}
                            className="text-red-600"
                          >
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}