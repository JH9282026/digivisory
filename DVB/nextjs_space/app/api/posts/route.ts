export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify, calculateWordCount, calculateReadingTime } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }];
    if (category) where.categories = { some: { category: { slug: category } } };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: where as any,
        include: { author: { select: { id: true, name: true, image: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where: where as any }),
    ]);
    return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    console.error('GET posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { title, content, contentType, excerpt, featuredImage, featuredImageAlt, status: postStatus, scheduledAt, metaTitle, metaDescription, metaRobots, canonicalUrl, ogImage, focusKeyword, schemaType, categoryIds, tagIds } = body ?? {};
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    let slug = slugify(body?.slug ?? title);
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    const wordCount = calculateWordCount(content ?? '');
    const readingTime = calculateReadingTime(content ?? '');
    const publishedAt = postStatus === 'published' ? new Date() : null;
    const post = await prisma.post.create({
      data: {
        title, slug, content, contentType: contentType ?? 'richtext', excerpt, featuredImage, featuredImageAlt,
        status: postStatus ?? 'draft', publishedAt, scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        metaTitle, metaDescription, metaRobots: metaRobots ?? 'index, follow', canonicalUrl, ogImage,
        focusKeyword, schemaType: schemaType ?? 'BlogPosting', wordCount, readingTime,
        authorId: (session.user as any).id,
        categories: categoryIds?.length ? { create: categoryIds.map((id: string) => ({ categoryId: id })) } : undefined,
        tags: tagIds?.length ? { create: tagIds.map((id: string) => ({ tagId: id })) } : undefined,
      },
      include: { author: { select: { id: true, name: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    console.error('POST posts error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
