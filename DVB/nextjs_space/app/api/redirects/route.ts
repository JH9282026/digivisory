export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const redirects = await prisma.redirectRule.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ redirects });
  } catch (error: unknown) {
    console.error('GET redirects error:', error);
    return NextResponse.json({ error: 'Failed to fetch redirects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { fromPath, toPath, type } = body ?? {};
    if (!fromPath || !toPath) return NextResponse.json({ error: 'fromPath and toPath required' }, { status: 400 });
    const redirect = await prisma.redirectRule.upsert({
      where: { fromPath },
      create: { fromPath, toPath, type: type ?? 301 },
      update: { toPath, type: type ?? 301 },
    });
    return NextResponse.json(redirect, { status: 201 });
  } catch (error: unknown) {
    console.error('POST redirects error:', error);
    return NextResponse.json({ error: 'Failed to create redirect' }, { status: 500 });
  }
}
