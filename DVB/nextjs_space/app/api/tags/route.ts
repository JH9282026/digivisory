export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ tags });
  } catch (error: unknown) {
    console.error('GET tags error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { name } = body ?? {};
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const slug = slugify(name);
    const tag = await prisma.tag.create({ data: { name, slug } });
    return NextResponse.json(tag, { status: 201 });
  } catch (error: unknown) {
    console.error('POST tags error:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
