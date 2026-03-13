export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify, calculateWordCount, calculateReadingTime } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { items, type, format } = body ?? {};
    if (!items || !Array.isArray(items)) return NextResponse.json({ error: 'Items array required' }, { status: 400 });
    const contentType = type ?? 'posts';
    const userId = (session.user as any).id;
    let imported = 0;
    for (const item of items) {
      try {
        const title = item?.title ?? 'Untitled';
        let slug = slugify(item?.slug ?? item?.post_name ?? title);
        if (contentType === 'posts') {
          const existing = await prisma.post.findUnique({ where: { slug } });
          if (existing) slug = `${slug}-${Date.now()}`;
          const content = item?.content ?? item?.['content:encoded'] ?? '';
          await prisma.post.create({
            data: {
              title, slug, content,
              excerpt: item?.excerpt ?? item?.['excerpt:encoded'] ?? '',
              status: (item?.status === 'publish' || item?.status === 'published') ? 'published' : 'draft',
              publishedAt: item?.publishedAt ? new Date(item.publishedAt) : (item?.pubDate ? new Date(item.pubDate) : null),
              wordCount: calculateWordCount(content),
              readingTime: calculateReadingTime(content),
              authorId: userId,
            },
          });
        } else {
          const existing = await prisma.page.findUnique({ where: { slug } });
          if (existing) slug = `${slug}-${Date.now()}`;
          await prisma.page.create({
            data: {
              title, slug,
              content: item?.content ?? item?.['content:encoded'] ?? '',
              status: (item?.status === 'publish' || item?.status === 'published') ? 'published' : 'draft',
              publishedAt: item?.publishedAt ? new Date(item.publishedAt) : null,
              authorId: userId,
            },
          });
        }
        imported++;
      } catch (e) {
        console.error('Import item error:', e);
      }
    }
    return NextResponse.json({ imported, total: items.length });
  } catch (error: unknown) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import' }, { status: 500 });
  }
}
