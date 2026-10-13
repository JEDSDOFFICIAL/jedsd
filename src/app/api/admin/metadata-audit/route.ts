/**
 * GET /api/admin/metadata-audit
 * 
 * Admin-only endpoint to audit all published papers for Google Scholar indexing compliance
 * Requires ADMIN role or canPublish permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { auditPaperMetadata, generateAuditReport } from '@/lib/metadata-audit';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin/editor permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.variableUserType !== 'ADMIN' && user.variableUserType !== 'EDITOR')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin or Editor role required' },
        { status: 403 }
      );
    }

    // Get query parameter to determine response type
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'summary';

    if (format === 'detailed') {
      // Return detailed audit results for each paper
      const results = await auditPaperMetadata();
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        totalPapers: results.length,
        papers: results,
      });
    } else {
      // Return summary report
      const report = await generateAuditReport();
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        ...report,
      });
    }
  } catch (error: any) {
    console.error('Metadata audit error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error performing audit',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
