export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { generateJsonLd } from '@/lib/seo-helpers';
import Sidebar from '../../_components/sidebar';
import { Calendar, User, Clock, ChevronRight, Home } from 'lucide-react';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, bio: true, image: true, expertise: true, twitterUrl: true, linkedinUrl: true, website: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
    return post;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params?.slug ?? '');
  if (!post) return { title: 'Not Found' };
  return {
    title: post?.metaTitle || post?.title || '',
    description: post?.metaDescription || post?.excerpt || '',
    openGraph: {
      title: post?.metaTitle || post?.title || '',
      description: post?.metaDescription || post?.excerpt || '',
      type: 'article',
      ...(post?.featuredImage ? { images: [{ url: post.featuredImage }] } : {}),
    },
    twitter: { card: 'summary_large_image' },
    ...(post?.canonicalUrl ? { alternates: { canonical: post.canonicalUrl } } : {}),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params?.slug ?? '');
  if (!post || post?.status !== 'PUBLISHED') notFound();

  let siteUrl = '';
  try {
    const s = await prisma.siteSettings.findFirst();
    siteUrl = s?.siteUrl ?? '';
  } catch {}

  const jsonLd = generateJsonLd({
    type: (post?.schemaType as any) ?? 'Article',
    title: post?.title ?? '',
    description: post?.metaDescription || post?.excerpt || '',
    url: `${siteUrl}/blog/${post?.slug ?? ''}`,
    image: post?.featuredImage ?? undefined,
    datePublished: post?.publishedAt?.toISOString(),
    dateModified: post?.updatedAt?.toISOString(),
    authorName: post?.author?.name ?? 'Admin',
    authorUrl: post?.author?.website ?? undefined,
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl || '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 3, name: post?.title ?? '' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-gray-400">
          <Link href="/" className="hover:text-indigo-600 flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
          <ChevronRight className="w-3 h-3" />
          {post?.categories?.[0]?.category && (
            <>
              <Link href={`/category/${post.categories[0].category?.slug ?? ''}`} className="hover:text-indigo-600">
                {post.categories[0].category?.name ?? ''}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-gray-600 truncate max-w-[200px]">{post?.title ?? ''}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {(post?.categories ?? []).map((cp: any) => (
                  <Link key={cp?.category?.id ?? ''} href={`/category/${cp?.category?.slug ?? ''}`} className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {cp?.category?.name ?? ''}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{post?.title ?? ''}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {post?.author?.name && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author.name}</span>}
                {post?.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.publishedAt)}</span>}
                {(post?.readingTime ?? 0) > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readingTime} min read</span>}
              </div>
            </header>

            {/* Featured Image */}
            {post?.featuredImage && (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
                <Image src={post.featuredImage} alt={post?.featuredImageAlt ?? post?.title ?? ''} fill className="object-cover" sizes="(max-width: 1200px) 100vw, 800px" priority />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-indigo prose-img:rounded-lg prose-a:text-indigo-600" dangerouslySetInnerHTML={{ __html: post?.content ?? '' }} />

            {/* Tags */}
            {(post?.tags?.length ?? 0) > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                {(post?.tags ?? []).map((tp: any) => (
                  <Link key={tp?.tag?.id ?? ''} href={`/tag/${tp?.tag?.slug ?? ''}`} className="text-xs bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 px-3 py-1 rounded-full transition-colors">
                    #{tp?.tag?.name ?? ''}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Box */}
            {post?.author && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4">
                  {post.author?.image && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image src={post.author.image} alt={post.author?.name ?? ''} fill className="object-cover" sizes="64px" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{post.author?.name ?? ''}</p>
                    {post.author?.expertise && <p className="text-xs text-indigo-600 mb-1">{post.author.expertise}</p>}
                    {post.author?.bio && <p className="text-sm text-gray-600">{post.author.bio}</p>}
                    <div className="mt-2 flex gap-3">
                      {post.author?.twitterUrl && <a href={post.author.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">Twitter</a>}
                      {post.author?.linkedinUrl && <a href={post.author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">LinkedIn</a>}
                      {post.author?.website && <a href={post.author.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">Website</a>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>

          <div className="hidden lg:block">
            
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
