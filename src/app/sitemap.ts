import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

// Revalidate every hour instead of force-dynamic so the sitemap is cached
// between deploys and doesn't hammer the DB on every crawler request.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPapers = await prisma.researchPaper.findMany({
    where: {
      status: { in: ['PUBLISH', 'PUBLISHED'] },
    },
    select: {
      paperId: true,
      acceptedDate: true,
      submissionDate: true,
    },
    orderBy: { acceptedDate: 'desc' },
  });

  const paperUrls: MetadataRoute.Sitemap = publishedPapers.map((paper) => ({
    url: `${SITE_URL}/paper/${encodeURIComponent(paper.paperId)}`,
    lastModified: new Date(paper.acceptedDate ?? paper.submissionDate),
    changeFrequency: 'monthly',
    priority: 0.95,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/paper`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
  ];

  return [...staticPages, ...paperUrls];
}
