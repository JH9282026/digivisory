export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    console.error('GET categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { name, description, parentId } = body ?? {};
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const slug = slugify(name);
    const category = await prisma.category.create({
      data: { name, slug, description, parentId },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error('POST categories error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
