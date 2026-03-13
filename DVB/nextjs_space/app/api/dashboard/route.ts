export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const [postsCount, pagesCount, categoriesCount, tagsCount, mediaCount, publishedPosts, draftPosts, recentPosts] = await Promise.all([
      prisma.post.count(),
      prisma.page.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.media.count(),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.post.count({ where: { status: 'draft' } }),
      prisma.post.findMany({ take: 5, orderBy: { updatedAt: 'desc' }, include: { author: { select: { name: true } } } }),
    ]);
    return NextResponse.json({ postsCount, pagesCount, categoriesCount, tagsCount, mediaCount, publishedPosts, draftPosts, recentPosts });
  } catch (error: unknown) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
