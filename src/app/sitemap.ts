import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://jedsd.com';

  try {
    // Fetch all published papers - includes BOTH 'PUBLISH' and 'PUBLISHED' and 'ACCEPTED' statuses
    // This ensures papers published with any of these statuses appear in Google Scholar
    const publishedPapers = await prisma.researchPaper.findMany({
      where: {
        status: {
          in: ['PUBLISH', 'PUBLISHED', 'ACCEPTED'],
        },
      },
      select: {
        paperId: true,
        acceptedDate: true,
        submissionDate: true,
        title: true,
        status: true,
      },
      orderBy: {
        acceptedDate: 'desc',
      },
    });

    console.log(`Found ${publishedPapers.length} published papers for sitemap`);

    // Generate paper URLs with enhanced metadata
    const paperUrls = publishedPapers.map((paper: { paperId: string; acceptedDate: Date | null; submissionDate: Date; title: string; status: string }) => ({
      url: `${baseUrl}/paper/${paper.paperId}`,
      lastModified: paper.acceptedDate || paper.submissionDate,
      changeFrequency: 'monthly' as const,
      priority: paper.status === 'PUBLISH' || paper.status === 'PUBLISHED' ? 0.95 : 0.8,
    }));

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/paper`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95,
      },
      {
        url: `${baseUrl}/guides`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ];

    return [...staticPages, ...paperUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return minimal sitemap on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ];
  }
}
