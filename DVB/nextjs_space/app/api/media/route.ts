export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getFileUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '30');
    const type = searchParams.get('type');
    const where: Record<string, unknown> = {};
    if (type) where.fileType = { startsWith: type };
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where: where as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where: where as any }),
    ]);
    const mediaWithUrls = await Promise.all(
      media.map(async (m) => {
        try {
          const url = await getFileUrl(m.cloudPath, m.isPublic);
          return { ...m, url };
        } catch {
          return { ...m, url: m.url ?? '' };
        }
      })
    );
    return NextResponse.json({ media: mediaWithUrls, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    console.error('GET media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
