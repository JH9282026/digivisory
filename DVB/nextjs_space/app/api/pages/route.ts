export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const pages = await prisma.page.findMany({
      where: where as any,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ pages });
  } catch (error: unknown) {
    console.error('GET pages error:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { title, content, contentType, status: pageStatus, template, parentId, sortOrder, metaTitle, metaDescription, metaRobots, canonicalUrl, ogImage, focusKeyword, schemaType } = body ?? {};
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    let slug = slugify(body?.slug ?? title);
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    const page = await prisma.page.create({
      data: {
        title, slug, content, contentType: contentType ?? 'richtext',
        status: pageStatus ?? 'draft', publishedAt: pageStatus === 'published' ? new Date() : null,
        template: template ?? 'default', parentId, sortOrder: sortOrder ?? 0,
        metaTitle, metaDescription, metaRobots: metaRobots ?? 'index, follow',
        canonicalUrl, ogImage, focusKeyword, schemaType: schemaType ?? 'WebPage',
        authorId: (session.user as any).id,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error: unknown) {
    console.error('POST pages error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
