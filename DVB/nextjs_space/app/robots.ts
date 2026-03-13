import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = '';

  try {
    const { prisma } = await import('@/lib/prisma');
    const settings = await prisma.siteSettings.findFirst();
    siteUrl = settings?.siteUrl ?? '';
  } catch {}

  if (!siteUrl) {
    try {
      const h = headers();
      const host = h?.get?.('x-forwarded-host') ?? h?.get?.('host') ?? 'localhost:3000';
      const proto = h?.get?.('x-forwarded-proto') ?? 'https';
      siteUrl = `${proto}://${host}`;
    } catch {}
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
