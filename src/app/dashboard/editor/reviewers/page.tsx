"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@prisma/client";
import { 
  UserCheck, 
  Mail, 
  GraduationCap, 
  Search, 
  Plus, 
  Filter,
  MoreHorizontal,
  Users,
  Trash2,
  AlertTriangle
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
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
  
  // Add Reviewer Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingReviewer, setIsAddingReviewer] = useState(false);
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  
  // Delete Confirmation Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState<ReviewerWithStats | null>(null);

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

  const fetchReviewersData = async () => {
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

  const handleAddReviewer = async () => {
    // Validation
    if (!newReviewerEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newReviewerEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsAddingReviewer(true);
    try {
      // Create UserDetails entry with REVIEWER type
      const response = await axios.post("/api/user/reviewer", {
        email: newReviewerEmail.trim(),
        userType: "REVIEWER"
      });

      toast.success(response.data.message || "Reviewer added successfully! They can now sign up as a reviewer.");
      
      // Reset form and close dialog
      setNewReviewerEmail("");
      setIsAddDialogOpen(false);
      
      // Refresh the reviewers list
      await fetchReviewersData();
    } catch (err: any) {
      console.error("Error adding reviewer:", err);
      const errorMessage = err.response?.data?.message || "Failed to add reviewer";
      toast.error(errorMessage);
    } finally {
      setIsAddingReviewer(false);
    }
  };

  const confirmDeleteReviewer = (reviewer: ReviewerWithStats) => {
    setReviewerToDelete(reviewer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReviewer = async () => {
    if (!reviewerToDelete) return;

    try {
      // Delete from UserDetails (authentication base)
      await axios.delete("/api/user/reviewer", {
        data: { emails: [reviewerToDelete.email] }
      });
      
      // Also delete from User table if exists
      await axios.delete("/api/user", {
        data: { userIds: [reviewerToDelete.id] }
      });
      
      toast.success(`Reviewer ${reviewerToDelete.name} has been deleted successfully`);
      setDeleteDialogOpen(false);
      setReviewerToDelete(null);
      
      // Refresh the list
      await fetchReviewersData();
    } catch (err) {
      console.error("Error deleting reviewer:", err);
      toast.error("Failed to delete reviewer");
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
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Reviewer
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => confirmDeleteReviewer(reviewer)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
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

      {/* Add Reviewer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Reviewer</DialogTitle>
            <DialogDescription>
              Register a reviewer email. They can then sign up with this email as a reviewer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Reviewer Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="reviewer@university.edu"
                value={newReviewerEmail}
                onChange={(e) => setNewReviewerEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAddingReviewer) {
                    e.preventDefault();
                    handleAddReviewer();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                This email will be registered as a reviewer. The person can then sign up using this email.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>User Type</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  REVIEWER
                </Badge>
                <span className="text-sm text-muted-foreground">
                  (Fixed - cannot be changed)
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewReviewerEmail("");
              }}
              disabled={isAddingReviewer}
            >
              Cancel
            </Button>
            <Button onClick={handleAddReviewer} disabled={isAddingReviewer}>
              {isAddingReviewer ? "Adding..." : "Add Reviewer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Reviewer Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{reviewerToDelete?.name}</strong>'s account?
              <br /><br />
              <span className="text-red-600 font-medium">
                This action cannot be undone. All their reviews and associated data will be permanently deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewerToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReviewer}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}