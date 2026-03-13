export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getPage(slug: string) {
  try {
    return await prisma.page.findUnique({ where: { slug } });
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params?.slug ?? '');
  if (!page) return { title: 'Not Found' };
  return {
    title: page?.metaTitle || page?.title || '',
    description: page?.metaDescription || '',
    ...(page?.canonicalUrl ? { alternates: { canonical: page.canonicalUrl } } : {}),
  };
}

export default async function StaticPage({ params }: Props) {
  const page = await getPage(params?.slug ?? '');
  if (!page || page?.status !== 'PUBLISHED') notFound();

  return (
    <div className="max-w-[900px] mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{page?.title ?? ''}</h1>
      <div className="prose prose-lg max-w-none prose-indigo" dangerouslySetInnerHTML={{ __html: page?.content ?? '' }} />
    </div>
  );
}
