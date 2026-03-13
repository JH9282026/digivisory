export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error: unknown) {
    console.error('GET settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) settings = await prisma.siteSettings.create({ data: {} });
    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        ...(body?.siteName !== undefined && { siteName: body.siteName }),
        ...(body?.tagline !== undefined && { tagline: body.tagline }),
        ...(body?.siteUrl !== undefined && { siteUrl: body.siteUrl }),
        ...(body?.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body?.faviconUrl !== undefined && { faviconUrl: body.faviconUrl }),
        ...(body?.defaultMetaTitle !== undefined && { defaultMetaTitle: body.defaultMetaTitle }),
        ...(body?.defaultMetaDesc !== undefined && { defaultMetaDesc: body.defaultMetaDesc }),
        ...(body?.permalinkStructure !== undefined && { permalinkStructure: body.permalinkStructure }),
        ...(body?.socialTwitter !== undefined && { socialTwitter: body.socialTwitter }),
        ...(body?.socialFacebook !== undefined && { socialFacebook: body.socialFacebook }),
        ...(body?.socialLinkedin !== undefined && { socialLinkedin: body.socialLinkedin }),
        ...(body?.socialGithub !== undefined && { socialGithub: body.socialGithub }),
        ...(body?.orgName !== undefined && { orgName: body.orgName }),
        ...(body?.orgLogoUrl !== undefined && { orgLogoUrl: body.orgLogoUrl }),
        ...(body?.enableSidebar !== undefined && { enableSidebar: body.enableSidebar }),
        ...(body?.colorScheme !== undefined && { colorScheme: body.colorScheme }),
        ...(body?.headerAdCode !== undefined && { headerAdCode: body.headerAdCode }),
        ...(body?.sidebarAdCode !== undefined && { sidebarAdCode: body.sidebarAdCode }),
        ...(body?.footerAdCode !== undefined && { footerAdCode: body.footerAdCode }),
        ...(body?.formCode !== undefined && { formCode: body.formCode }),
        ...(body?.robotsTxt !== undefined && { robotsTxt: body.robotsTxt }),
        ...(body?.customCss !== undefined && { customCss: body.customCss }),
        ...(body?.customHeadCode !== undefined && { customHeadCode: body.customHeadCode }),
      },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('PUT settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
