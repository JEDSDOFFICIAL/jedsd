'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  BarChart3,
  FileText,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MetadataIssue {
  paperId: string;
  title: string;
  status: string;
  hasAuthor: boolean;
  hasContributors: boolean;
  hasAbstract: boolean;
  hasKeywords: boolean;
  hasFilePath: boolean;
  hasDOI: boolean;
  hasPublicationDate: boolean;
  issues: string[];
  isGoogleScholarReady: boolean;
}

interface AuditReport {
  success: boolean;
  timestamp: string;
  totalPapers: number;
  readyForGoogleScholar: number;
  issues: Array<{ paper: string; issues: string[] }>;
  summary: string;
  papers?: MetadataIssue[];
}

export default function MetadataAuditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState<AuditReport | null>(null);
  const [detailedData, setDetailedData] = useState<MetadataIssue[]>([]);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIssues, setFilterIssues] = useState<'all' | 'issues' | 'ready'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Check authorization
  useEffect(() => {
    if (session?.user?.variableUserType !== 'ADMIN' && session?.user?.variableUserType !== 'EDITOR') {
      router.push('/dashboard');
    }
  }, [session, router]);

  const fetchAuditData = async (detailed: boolean = false) => {
    try {
      setRefreshing(true);
      const format = detailed ? 'detailed' : 'summary';
      const response = await fetch(`/api/admin/metadata-audit?format=${format}`);

      if (!response.ok) {
        throw new Error('Failed to fetch audit data');
      }

      const data = await response.json();

      if (detailed) {
        setDetailedData(data.papers || []);
      } else {
        setAuditData(data);
      }
    } catch (error) {
      console.error('Error fetching audit data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditData(false);
  }, []);

  const handleViewMode = (mode: 'summary' | 'detailed') => {
    setViewMode(mode);
    if (mode === 'detailed' && detailedData.length === 0) {
      fetchAuditData(true);
    }
  };

  const getFilteredPapers = () => {
    let filtered = detailedData;

    if (searchTerm) {
      filtered = filtered.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.paperId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterIssues === 'issues') {
      filtered = filtered.filter((paper) => paper.issues.length > 0);
    } else if (filterIssues === 'ready') {
      filtered = filtered.filter((paper) => paper.isGoogleScholarReady);
    }

    return filtered;
  };

  const downloadReport = () => {
    const report = {
      timestamp: auditData?.timestamp,
      totalPapers: auditData?.totalPapers,
      readyForGoogleScholar: auditData?.readyForGoogleScholar,
      completenessPercentage: auditData?.readyForGoogleScholar
        ? Math.round((auditData.readyForGoogleScholar / auditData.totalPapers) * 100)
        : 0,
      papers: detailedData,
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2)));
    element.setAttribute('download', `metadata-audit-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-yellow-800">Checking authorization...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Metadata Audit Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor Google Scholar indexing compliance for all published papers
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {auditData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Papers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{auditData.totalPapers}</div>
              <p className="text-xs text-gray-500 mt-1">Published Papers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Ready for Indexing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{auditData.readyForGoogleScholar}</div>
              <p className="text-xs text-gray-500 mt-1">
                {auditData.totalPapers > 0
                  ? `${Math.round((auditData.readyForGoogleScholar / auditData.totalPapers) * 100)}%`
                  : '0%'}{' '}
                complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Need Fixes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {auditData.totalPapers - auditData.readyForGoogleScholar}
              </div>
              <p className="text-xs text-gray-500 mt-1">Papers with issues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Last Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono text-blue-600">
                {new Date(auditData.timestamp).toLocaleDateString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(auditData.timestamp).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'summary' ? 'default' : 'outline'}
            onClick={() => handleViewMode('summary')}
            className="w-full sm:w-auto"
          >
            Summary View
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            onClick={() => handleViewMode('detailed')}
            className="w-full sm:w-auto"
          >
            Detailed View
          </Button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => fetchAuditData(viewMode === 'detailed')}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={downloadReport}
            disabled={!auditData}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && auditData && (
        <div className="space-y-6">
          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Indexing Compliance Overview</CardTitle>
              <CardDescription>
                Status of all published papers for Google Scholar indexing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-bold">
                      {auditData.totalPapers > 0
                        ? Math.round((auditData.readyForGoogleScholar / auditData.totalPapers) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${auditData.totalPapers > 0 ? (auditData.readyForGoogleScholar / auditData.totalPapers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-900">Ready for Indexing</h3>
                        <p className="text-sm text-green-700 mt-1">
                          {auditData.readyForGoogleScholar} papers have complete metadata and are ready for Google Scholar
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-orange-900">Need Attention</h3>
                        <p className="text-sm text-orange-700 mt-1">
                          {auditData.totalPapers - auditData.readyForGoogleScholar} papers have missing or incomplete metadata
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Summary */}
          {auditData.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Common Issues Detected
                </CardTitle>
                <CardDescription>
                  Most frequent metadata problems across all papers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditData.issues.slice(0, 10).map((issue, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {issue.paper}
                      </h4>
                      <div className="space-y-1">
                        {issue.issues.map((problem, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-orange-600 font-bold">•</span>
                            <span>{problem}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {auditData.issues.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setViewMode('detailed')}>
                      View All Issues
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Recommendations to improve Google Scholar indexing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Fix Missing Metadata</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Update {auditData.totalPapers - auditData.readyForGoogleScholar} papers with complete author information,
                      keywords, and publication details
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Submit Sitemap</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Add your domain to Google Search Console and submit{' '}
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">/sitemap.xml</code>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Assign DOIs</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      DOI assignment significantly speeds up indexing (1-2 days vs 1-2 weeks)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Monitor Indexing</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Check Google Scholar in 1-4 weeks for first-time indexing, 1-2 weeks for updates
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Paper List</CardTitle>
              <CardDescription>
                {getFilteredPapers().length} of {detailedData.length} papers shown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title or paper ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterIssues === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterIssues('all')}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterIssues === 'issues' ? 'default' : 'outline'}
                      onClick={() => setFilterIssues('issues')}
                      size="sm"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Issues
                    </Button>
                    <Button
                      variant={filterIssues === 'ready' ? 'default' : 'outline'}
                      onClick={() => setFilterIssues('ready')}
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Ready
                    </Button>
                  </div>
                </div>

                {/* Papers Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Ready</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Issues</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredPapers().map((paper) => (
                        <tr key={paper.paperId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="max-w-xs">
                              <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                                {paper.title}
                              </p>
                              <p className="text-xs text-gray-500 font-mono mt-1">{paper.paperId}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {paper.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {paper.isGoogleScholarReady ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-orange-600 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {paper.issues.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {paper.issues.slice(0, 2).map((issue, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {issue.split(' ').slice(0, 2).join(' ')}...
                                  </Badge>
                                ))}
                                {paper.issues.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{paper.issues.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/paper/${paper.paperId}`} target="_blank">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredPapers().length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No papers found matching your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Issues */}
          <div className="space-y-4">
            {detailedData
              .filter((p) => p.issues.length > 0)
              .filter((p) => filterIssues === 'all' || (filterIssues === 'issues' && p.issues.length > 0))
              .filter((p) =>
                searchTerm ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
              )
              .map((paper) => (
                <Card key={paper.paperId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{paper.title}</CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">
                          {paper.paperId}
                        </CardDescription>
                      </div>
                      <Badge variant={paper.isGoogleScholarReady ? 'default' : 'destructive'}>
                        {paper.isGoogleScholarReady ? 'Ready' : `${paper.issues.length} Issues`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Author</p>
                        <p className="text-sm font-medium">
                          {paper.hasAuthor ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Contributors</p>
                        <p className="text-sm font-medium">
                          {paper.hasContributors ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Abstract</p>
                        <p className="text-sm font-medium">
                          {paper.hasAbstract ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Keywords</p>
                        <p className="text-sm font-medium">
                          {paper.hasKeywords ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">PDF File</p>
                        <p className="text-sm font-medium">
                          {paper.hasFilePath ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">DOI</p>
                        <p className="text-sm font-medium">
                          {paper.hasDOI ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Pub Date</p>
                        <p className="text-sm font-medium">
                          {paper.hasPublicationDate ? '✓' : '✗'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <p className="text-sm font-medium">{paper.status}</p>
                      </div>
                    </div>

                    {paper.issues.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Issues Found:
                        </p>
                        <ul className="space-y-1">
                          {paper.issues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                              <span className="text-orange-600 font-bold">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link href={`/paper/${paper.paperId}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Paper
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Loading metadata audit data...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
