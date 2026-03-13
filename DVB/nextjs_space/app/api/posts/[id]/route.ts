export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify, calculateWordCount, calculateReadingTime } from '@/lib/utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: { select: { id: true, name: true, image: true, bio: true, jobTitle: true, twitterUrl: true, linkedinUrl: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
    });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error('GET post error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { title, content, contentType, excerpt, featuredImage, featuredImageAlt, status: postStatus, scheduledAt, metaTitle, metaDescription, metaRobots, canonicalUrl, ogImage, focusKeyword, schemaType, categoryIds, tagIds } = body ?? {};
    let slug = body?.slug ? slugify(body.slug) : undefined;
    if (slug) {
      const existing = await prisma.post.findFirst({ where: { slug, NOT: { id: params.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
    }
    const wordCount = content ? calculateWordCount(content) : undefined;
    const readingTime = content ? calculateReadingTime(content) : undefined;
    const currentPost = await prisma.post.findUnique({ where: { id: params.id } });
    let publishedAt = currentPost?.publishedAt;
    if (postStatus === 'published' && !publishedAt) publishedAt = new Date();
    if (categoryIds !== undefined) {
      await prisma.categoriesOnPosts.deleteMany({ where: { postId: params.id } });
    }
    if (tagIds !== undefined) {
      await prisma.tagsOnPosts.deleteMany({ where: { postId: params.id } });
    }
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(contentType !== undefined && { contentType }),
        ...(excerpt !== undefined && { excerpt }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(featuredImageAlt !== undefined && { featuredImageAlt }),
        ...(postStatus !== undefined && { status: postStatus }),
        publishedAt,
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaRobots !== undefined && { metaRobots }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(ogImage !== undefined && { ogImage }),
        ...(focusKeyword !== undefined && { focusKeyword }),
        ...(schemaType !== undefined && { schemaType }),
        ...(wordCount !== undefined && { wordCount }),
        ...(readingTime !== undefined && { readingTime }),
        ...(categoryIds !== undefined && { categories: { create: categoryIds.map((id: string) => ({ categoryId: id })) } }),
        ...(tagIds !== undefined && { tags: { create: tagIds.map((id: string) => ({ tagId: id })) } }),
      },
      include: { author: { select: { id: true, name: true } }, categories: { include: { category: true } }, tags: { include: { tag: true } } },
    });
    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error('PUT post error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE post error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
