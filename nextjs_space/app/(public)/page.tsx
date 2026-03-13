export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate, truncate } from '@/lib/utils';
import Sidebar from './_components/sidebar';
import { Calendar, User } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'DVB Blog';
  let desc = 'Welcome to our blog';
  try {
    const settings = await prisma.siteSettings.findFirst();
    siteName = settings?.siteName ?? siteName;
    desc = settings?.defaultMetaDesc ?? desc;
  } catch {}
  return { title: siteName, description: desc };
}

export default async function HomePage() {
  let posts: any[] = [];
  let siteName = 'DVB Blog';
  let tagline = '';

  try {
    const settings = await prisma.siteSettings.findFirst();
    siteName = settings?.siteName ?? siteName;
    tagline = settings?.tagline ?? '';
  } catch {}

  try {
    posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 12,
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } },
      },
    });
  } catch {}

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{siteName}</h1>
        {tagline && <p className="text-lg text-gray-500">{tagline}</p>}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts Grid */}
        <div className="lg:col-span-2">
          {(posts?.length ?? 0) === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400">No posts published yet. Check back soon!</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(posts ?? []).map((post: any) => {
              const cat = post?.categories?.[0]?.category;
              return (
                <article key={post?.id ?? ''} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group">
                  {post?.featuredImage && (
                    <Link href={`/blog/${post?.slug ?? ''}`}>
                      <div className="relative aspect-video bg-gray-100">
                        <Image src={post.featuredImage} alt={post?.featuredImageAlt ?? post?.title ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 50vw" />
                      </div>
                    </Link>
                  )}
                  <div className="p-5">
                    {cat && (
                      <Link href={`/category/${cat?.slug ?? ''}`} className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                        {cat?.name ?? ''}
                      </Link>
                    )}
                    <h2 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      <Link href={`/blog/${post?.slug ?? ''}`}>{post?.title ?? 'Untitled'}</Link>
                    </h2>
                    {post?.excerpt && <p className="mt-2 text-sm text-gray-500 line-clamp-3">{truncate(post.excerpt, 120)}</p>}
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      {post?.author?.name && (
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author.name}</span>
                      )}
                      {post?.publishedAt && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>
                      )}
                      {(post?.readingTime ?? 0) > 0 && <span>{post.readingTime} min read</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
