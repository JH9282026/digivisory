export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { deleteFile } from '@/lib/s3';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { altText, caption } = body ?? {};
    const media = await prisma.media.update({
      where: { id: params.id },
      data: { ...(altText !== undefined && { altText }), ...(caption !== undefined && { caption }) },
    });
    return NextResponse.json(media);
  } catch (error: unknown) {
    console.error('PUT media error:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (media?.cloudPath) {
      try { await deleteFile(media.cloudPath); } catch { /* ignore */ }
    }
    await prisma.media.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE media error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
