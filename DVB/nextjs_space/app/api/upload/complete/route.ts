export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getFileUrl } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { cloud_storage_path, isPublic, fileName, fileType, fileSize, altText, width, height } = body ?? {};
    if (!cloud_storage_path) return NextResponse.json({ error: 'cloud_storage_path required' }, { status: 400 });
    const url = await getFileUrl(cloud_storage_path, isPublic ?? true);
    const media = await prisma.media.create({
      data: {
        fileName: fileName ?? 'unknown',
        fileType: fileType ?? 'application/octet-stream',
        fileSize: fileSize ?? 0,
        cloudPath: cloud_storage_path,
        isPublic: isPublic ?? true,
        url,
        altText: altText ?? '',
        width: width ?? null,
        height: height ?? null,
      },
    });
    return NextResponse.json(media);
  } catch (error: unknown) {
    console.error('Upload complete error:', error);
    return NextResponse.json({ error: 'Failed to save media' }, { status: 500 });
  }
}
