import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://jedsd.com';

  try {
    // Fetch all published papers from database
    const publishedPapers = await prisma.researchPaper.findMany({
      where: {
        status: 'PUBLISH',
      },
      select: {
        id: true,
        acceptedDate: true,
        submissionDate: true,
      },
      orderBy: {
        acceptedDate: 'desc',
      },
    });

    // Generate paper URLs
    const paperUrls = publishedPapers.map((paper: { id: string; acceptedDate: Date | null; submissionDate: Date }) => ({
      url: `${baseUrl}/paper/${paper.id}`,
      lastModified: paper.acceptedDate || paper.submissionDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
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
        url: `${baseUrl}/guides`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
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
