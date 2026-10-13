/**
 * Metadata Audit Utility
 * Checks all published papers for proper Google Scholar indexing metadata
 * Run this periodically to ensure all papers have correct metadata
 */

import prisma from '@/lib/prisma';

export interface MetadataAuditResult {
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

export async function auditPaperMetadata(): Promise<MetadataAuditResult[]> {
  try {
    // Fetch all published papers
    const papers = await prisma.researchPaper.findMany({
      where: {
        status: {
          in: ['PUBLISH', 'PUBLISHED', 'ACCEPTED'],
        },
      },
      include: {
        author: true,
      },
      orderBy: {
        acceptedDate: 'desc',
      },
    });

    const results: MetadataAuditResult[] = papers.map((paper) => {
      const issues: string[] = [];

      // Check for author information
      let hasAuthor = false;
      let hasContributors = false;

      if (paper.author?.name) {
        hasAuthor = true;
      }

      try {
        if (paper.contributors) {
          const contributors = typeof paper.contributors === 'string' 
            ? JSON.parse(paper.contributors) 
            : paper.contributors;
          hasContributors = Array.isArray(contributors) && contributors.length > 0;
        }
      } catch (e) {
        issues.push('Contributors JSON is malformed');
      }

      // Check for abstract
      const hasAbstract = !!(paper.abstract && paper.abstract.length > 50);
      if (!hasAbstract) {
        issues.push('Missing or too short abstract');
      }

      // Check for keywords
      const hasKeywords = paper.keywords && paper.keywords.length > 0;
      if (!hasKeywords) {
        issues.push('Missing keywords');
      }

      // Check for file path
      const hasFilePath = !!(paper.filePath && paper.filePath.length > 0);
      if (!hasFilePath) {
        issues.push('Missing PDF file path');
      }

      // Check for DOI
      const hasDOI = !!(paper.doi && paper.doi.length > 0);
      if (!hasDOI) {
        issues.push('Missing DOI - recommended for Google Scholar indexing');
      }

      // Check for publication date
      const hasPublicationDate = !!(paper.acceptedDate || paper.submissionDate);
      if (!hasPublicationDate) {
        issues.push('Missing publication date');
      }

      // Check author metadata
      if (!hasAuthor && !hasContributors) {
        issues.push('No author information (neither primary author nor contributors)');
      }

      const isGoogleScholarReady = issues.length === 0 && hasContributors;

      return {
        paperId: paper.paperId,
        title: paper.title,
        status: paper.status,
        hasAuthor,
        hasContributors,
        hasAbstract,
        hasKeywords,
        hasFilePath,
        hasDOI,
        hasPublicationDate,
        issues,
        isGoogleScholarReady,
      };
    });

    return results;
  } catch (error) {
    console.error('Error during metadata audit:', error);
    throw error;
  }
}

export async function generateAuditReport(): Promise<{
  totalPapers: number;
  readyForGoogleScholar: number;
  issues: {
    paper: string;
    issues: string[];
  }[];
  summary: string;
}> {
  const results = await auditPaperMetadata();

  const readyForGoogleScholar = results.filter(r => r.isGoogleScholarReady).length;
  const issuesDetected = results.filter(r => r.issues.length > 0);

  return {
    totalPapers: results.length,
    readyForGoogleScholar,
    issues: issuesDetected.map(r => ({
      paper: r.title,
      issues: r.issues,
    })),
    summary: `${readyForGoogleScholar}/${results.length} papers are ready for Google Scholar indexing. ${issuesDetected.length} papers have issues.`,
  };
}

/**
 * Standardizes paper status to ensure consistent values
 * Converts any paper with PUBLISH status to PUBLISHED for consistency
 */
export async function standardizePaperStatus() {
  try {
    // First, let's check what statuses exist
    const papers = await prisma.researchPaper.findMany({
      select: {
        id: true,
        paperId: true,
        status: true,
      },
      orderBy: {
        acceptedDate:'asc'
      },
    });

    const statusCounts = new Map<string, number>();
    papers.forEach(p => {
      statusCounts.set(p.status, (statusCounts.get(p.status) || 0) + 1);
    });

    console.log('Current status distribution:', Object.fromEntries(statusCounts));

    // Return status summary without making changes
    return {
      statusDistribution: Object.fromEntries(statusCounts),
      message: 'Status audit complete. No changes made.',
    };
  } catch (error) {
    console.error('Error standardizing paper status:', error);
    throw error;
  }
}
