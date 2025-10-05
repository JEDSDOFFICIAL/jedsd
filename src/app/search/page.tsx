"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  Download,
  ExternalLink,
  Clock,
  Eye,
  BookOpen
} from 'lucide-react';
import { SearchFilters } from '@/types/dataTypes';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  submissionDate: string;
  acceptedDate?: string;
  status: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviews?: {
    id: string;
    rating: number;
    reviewerStatus: string;
  }[];
}

export default function SearchPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<ResearchPaper[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    titleQuery: "",
    keywordQuery: "",
    authorQuery: "",
    abstractQuery: "",
    sortBy: "submissionDate",
    sortOrder: "desc",
    yearFilter: "",
  });

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/paper');
      if (response.ok) {
        const result = await response.json();
        setPapers(result.data || []);
        setFilteredPapers(result.data || []);
      } else {
        toast.error('Failed to fetch papers');
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Error loading papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  useEffect(() => {
    filterPapers();
  }, [searchFilters, papers]);

  const filterPapers = () => {
    const filtered = papers.filter(paper => {
      const titleMatch = !searchFilters.titleQuery || 
        paper.title.toLowerCase().includes(searchFilters.titleQuery.toLowerCase());
      
      const authorMatch = !searchFilters.authorQuery || 
        paper.author.name.toLowerCase().includes(searchFilters.authorQuery.toLowerCase());
      
      const abstractMatch = !searchFilters.abstractQuery || 
        paper.abstract.toLowerCase().includes(searchFilters.abstractQuery.toLowerCase());
      
      const keywordMatch = !searchFilters.keywordQuery || 
        paper.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchFilters.keywordQuery.toLowerCase())
        );
      
      const yearMatch = !searchFilters.yearFilter || 
        new Date(paper.submissionDate).getFullYear().toString() === searchFilters.yearFilter;

      return titleMatch && authorMatch && abstractMatch && keywordMatch && yearMatch;
    });

    // Sort papers
    filtered.sort((a, b) => {
      const aValue = a[searchFilters.sortBy as keyof ResearchPaper];
      const bValue = b[searchFilters.sortBy as keyof ResearchPaper];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (searchFilters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPapers(filtered);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      titleQuery: "",
      keywordQuery: "",
      authorQuery: "",
      abstractQuery: "",
      sortBy: "submissionDate",
      sortOrder: "desc",
      yearFilter: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISH': return 'bg-green-100 text-green-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'ON_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PUBLISH': return 'Published';
      case 'ACCEPTED': return 'Accepted';
      case 'ON_REVIEW': return 'Under Review';
      case 'REJECTED': return 'Rejected';
      case 'UPLOAD': return 'Uploaded';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Search className="h-8 w-8" />
          Research Paper Search
        </h1>
        <p className="text-muted-foreground">
          Discover and explore research papers in our database
        </p>
      </div>

      {/* Search Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Search by title..."
                value={searchFilters.titleQuery}
                onChange={(e) => handleFilterChange("titleQuery", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Search by author..."
                value={searchFilters.authorQuery}
                onChange={(e) => handleFilterChange("authorQuery", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="Search by keywords..."
                value={searchFilters.keywordQuery}
                onChange={(e) => handleFilterChange("keywordQuery", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="abstract">Abstract</Label>
              <Input
                id="abstract"
                placeholder="Search in abstract..."
                value={searchFilters.abstractQuery}
                onChange={(e) => handleFilterChange("abstractQuery", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                placeholder="e.g., 2024"
                value={searchFilters.yearFilter}
                onChange={(e) => handleFilterChange("yearFilter", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={searchFilters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submissionDate">Submission Date</SelectItem>
                  <SelectItem value="acceptedDate">Acceptance Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">Order</Label>
              <Select value={searchFilters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredPapers.length} papers
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPapers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
              <p className="text-gray-600">Try adjusting your search filters or search terms.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPapers.map((paper) => (
            <Card key={paper.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {paper.title}
                      </h3>
                      <Badge className={`ml-4 flex-shrink-0 ${getStatusColor(paper.status)}`}>
                        {formatStatus(paper.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{paper.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(paper.submissionDate).toLocaleDateString()}</span>
                      </div>
                      {paper.reviews && paper.reviews.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{paper.reviews.length} reviews</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {paper.abstract}
                    </p>

                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.keywords.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {paper.keywords.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{paper.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:ml-4">
                    <Link href={`/paper/${paper.id}`}>
                      <Button size="sm" className="w-full lg:w-auto">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {paper.status === 'PUBLISH' && (
                      <Button size="sm" variant="outline" className="w-full lg:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}