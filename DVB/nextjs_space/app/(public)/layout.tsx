import { prisma } from '@/lib/prisma';
import PublicHeader from './_components/public-header';
import PublicFooter from './_components/public-footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let siteName = 'DVB Blog';
  let tagline = '';
  let headerMenu: { label: string; url: string }[] = [];
  let footerMenu: { label: string; url: string }[] = [];

  try {
    const settings = await prisma.siteSettings.findFirst();
    siteName = settings?.siteName || 'DVB Blog';
    tagline = settings?.tagline || '';
  } catch {}

  try {
    const hMenu = await prisma.menu.findFirst({ where: { location: 'HEADER' }, include: { items: { orderBy: { sortOrder: 'asc' } } } });
    headerMenu = (hMenu?.items ?? []).map((i) => ({ label: i?.label ?? '', url: i?.url ?? '#' }));
  } catch {}

  try {
    const fMenu = await prisma.menu.findFirst({ where: { location: 'FOOTER' }, include: { items: { orderBy: { sortOrder: 'asc' } } } });
    footerMenu = (fMenu?.items ?? []).map((i) => ({ label: i?.label ?? '', url: i?.url ?? '#' }));
  } catch {}

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader siteName={siteName} tagline={tagline} menuItems={headerMenu} />
      <main className="flex-1">{children}</main>
      <PublicFooter siteName={siteName} menuItems={footerMenu} />
    </div>
  );
}
