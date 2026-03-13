export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return NextResponse.json({ menus });
  } catch (error: unknown) {
    console.error('GET menus error:', error);
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { name, location, items } = body ?? {};
    if (!name || !location) return NextResponse.json({ error: 'Name and location required' }, { status: 400 });
    const menu = await prisma.menu.upsert({
      where: { location },
      create: {
        name, location,
        items: items?.length ? { create: (items as any[]).map((item: any, i: number) => ({ label: item.label, url: item.url, target: item?.target ?? '_self', sortOrder: i, parentId: item?.parentId ?? null })) } : undefined,
      },
      update: {
        name,
        items: { deleteMany: {}, create: items?.length ? (items as any[]).map((item: any, i: number) => ({ label: item.label, url: item.url, target: item?.target ?? '_self', sortOrder: i, parentId: item?.parentId ?? null })) : [] },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return NextResponse.json(menu);
  } catch (error: unknown) {
    console.error('POST menus error:', error);
    return NextResponse.json({ error: 'Failed to save menu' }, { status: 500 });
  }
}
