/**
 * GET /api/pdf/[file]
 *
 * Same-host PDF proxy for Google Scholar.
 * Scholar requires citation_pdf_url to be on the same host as the abstract page.
 * Firebase Storage URLs are tokenised third-party URLs — Scholar ignores them.
 *
 * Usage: /api/pdf/JEDSD-P-123456-7890.pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;

  // Strip .pdf suffix and decode URI encoding
  const paperId = decodeURIComponent(file.replace(/\.pdf$/i, ''));

  if (!paperId) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Only serve published papers
  const paper = await prisma.researchPaper.findFirst({
    where: {
      paperId,
      status: { in: ['PUBLISH', 'PUBLISHED'] },
    },
    select: { filePath: true },
  });

  if (!paper?.filePath) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Fetch the PDF from Firebase Storage (server-side — no CORS involved)
  let upstream: Response;
  try {
    upstream = await fetch(paper.filePath, { cache: 'no-store' });
  } catch {
    return new NextResponse('Upstream fetch failed', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${paperId}.pdf"`,
    'Cache-Control': 'public, max-age=86400',
  });

  // Forward Content-Length when upstream provides it
  const upstreamLength = upstream.headers.get('content-length');
  if (upstreamLength) {
    headers.set('Content-Length', upstreamLength);
  }

  return new NextResponse(upstream.body, { status: 200, headers });
}
