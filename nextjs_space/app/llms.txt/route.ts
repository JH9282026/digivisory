export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  let siteName = 'DVB Blog';
  let siteUrl = '';
  let desc = '';

  try {
    const settings = await prisma.siteSettings.findFirst();
    siteName = settings?.siteName ?? siteName;
    siteUrl = settings?.siteUrl ?? '';
    desc = settings?.defaultMetaDesc ?? '';
  } catch {}

  if (!siteUrl) {
    try {
      const h = headers();
      const host = h?.get?.('x-forwarded-host') ?? h?.get?.('host') ?? 'localhost:3000';
      const proto = h?.get?.('x-forwarded-proto') ?? 'https';
      siteUrl = `${proto}://${host}`;
    } catch {}
  }

  let postsList = '';
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      select: { title: true, slug: true, excerpt: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    postsList = (posts ?? []).map((p: any) => `- [${p?.title ?? ''}](${siteUrl}/blog/${p?.slug ?? ''}): ${p?.excerpt ?? ''}`).join('\n');
  } catch {}

  const txt = `# ${siteName}\n\n> ${desc}\n\n## About\n\n${siteName} is a blog covering various topics.\n\n## Content\n\n${postsList || 'No published content yet.'}\n\n## URLs\n\n- Homepage: ${siteUrl}\n- Sitemap: ${siteUrl}/sitemap.xml\n`;

  return new NextResponse(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
