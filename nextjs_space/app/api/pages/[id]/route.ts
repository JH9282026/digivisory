export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify } from '@/lib/utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: { author: { select: { id: true, name: true, image: true, bio: true, jobTitle: true } } },
    });
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error: unknown) {
    console.error('GET page error:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { title, content, contentType, status: pageStatus, template, parentId, sortOrder, metaTitle, metaDescription, metaRobots, canonicalUrl, ogImage, focusKeyword, schemaType } = body ?? {};
    let slug = body?.slug ? slugify(body.slug) : undefined;
    if (slug) {
      const existing = await prisma.page.findFirst({ where: { slug, NOT: { id: params.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
    }
    const currentPage = await prisma.page.findUnique({ where: { id: params.id } });
    let publishedAt = currentPage?.publishedAt;
    if (pageStatus === 'published' && !publishedAt) publishedAt = new Date();
    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(contentType !== undefined && { contentType }),
        ...(pageStatus !== undefined && { status: pageStatus }),
        publishedAt,
        ...(template !== undefined && { template }),
        ...(parentId !== undefined && { parentId }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaRobots !== undefined && { metaRobots }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(ogImage !== undefined && { ogImage }),
        ...(focusKeyword !== undefined && { focusKeyword }),
        ...(schemaType !== undefined && { schemaType }),
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return NextResponse.json(page);
  } catch (error: unknown) {
    console.error('PUT page error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.page.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE page error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
