import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const entries: MetadataRoute.Sitemap = [{ url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];

  try {
    const { prisma } = await import('@/lib/prisma');
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    for (const p of posts ?? []) {
      entries.push({ url: `${siteUrl}/blog/${p?.slug ?? ''}`, lastModified: p?.updatedAt ?? new Date(), changeFrequency: 'weekly', priority: 0.8 });
    }

    const pages = await prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    for (const pg of pages ?? []) {
      entries.push({ url: `${siteUrl}/page/${pg?.slug ?? ''}`, lastModified: pg?.updatedAt ?? new Date(), changeFrequency: 'monthly', priority: 0.6 });
    }

    const cats = await prisma.category.findMany({ select: { slug: true } });
    for (const c of cats ?? []) {
      entries.push({ url: `${siteUrl}/category/${c?.slug ?? ''}`, changeFrequency: 'weekly', priority: 0.5 });
    }
  } catch {}

  return entries;
}
