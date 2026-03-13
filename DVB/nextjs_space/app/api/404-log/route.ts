export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const logs = await prisma.notFoundLog.findMany({ orderBy: { lastSeen: 'desc' }, take: 100 });
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error('GET 404 logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referer, userAgent } = body ?? {};
    if (!path) return NextResponse.json({ error: 'Path required' }, { status: 400 });
    await prisma.notFoundLog.upsert({
      where: { path },
      create: { path, referer, userAgent },
      update: { count: { increment: 1 }, lastSeen: new Date(), referer, userAgent },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('POST 404 log error:', error);
    return NextResponse.json({ error: 'Failed to log 404' }, { status: 500 });
  }
}
