export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { id: true, name: true, email: true, image: true, bio: true, expertise: true, credentials: true, jobTitle: true, website: true, twitterUrl: true, linkedinUrl: true, githubUrl: true, role: true },
    });
    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('GET user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body?.name !== undefined) data.name = body.name;
    if (body?.image !== undefined) data.image = body.image;
    if (body?.bio !== undefined) data.bio = body.bio;
    if (body?.expertise !== undefined) data.expertise = body.expertise;
    if (body?.credentials !== undefined) data.credentials = body.credentials;
    if (body?.jobTitle !== undefined) data.jobTitle = body.jobTitle;
    if (body?.website !== undefined) data.website = body.website;
    if (body?.twitterUrl !== undefined) data.twitterUrl = body.twitterUrl;
    if (body?.linkedinUrl !== undefined) data.linkedinUrl = body.linkedinUrl;
    if (body?.githubUrl !== undefined) data.githubUrl = body.githubUrl;
    if (body?.password && body.password.length >= 6) {
      data.password = await bcrypt.hash(body.password, 12);
    }
    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: data as any,
      select: { id: true, name: true, email: true, image: true, bio: true, expertise: true, credentials: true, jobTitle: true, website: true, twitterUrl: true, linkedinUrl: true, githubUrl: true, role: true },
    });
    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('PUT user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
