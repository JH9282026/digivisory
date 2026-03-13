export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate, truncate } from '@/lib/utils';
import Sidebar from '../../_components/sidebar';
import { Calendar, User } from 'lucide-react';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { post: { status: 'PUBLISHED', publishedAt: { lte: new Date() } } },
          include: { post: { include: { author: { select: { name: true } } } } },
          orderBy: { post: { publishedAt: 'desc' } },
        },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategory(params?.slug ?? '');
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat?.name ?? ''} \u2014 Category`,
    description: cat?.description || `Posts in category ${cat?.name ?? ''}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const cat = await getCategory(params?.slug ?? '');
  if (!cat) notFound();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Category: <span className="text-indigo-600">{cat?.name ?? ''}</span></h1>
        {cat?.description && <p className="mt-2 text-gray-500">{cat.description}</p>}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {(cat?.posts?.length ?? 0) === 0 && <p className="text-gray-400">No posts in this category yet.</p>}
          <div className="space-y-6">
            {(cat?.posts ?? []).map((cp: any) => {
              const post = cp?.post;
              if (!post) return null;
              return (
                <article key={post?.id ?? ''} className="flex gap-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
                  {post?.featuredImage && (
                    <Link href={`/blog/${post?.slug ?? ''}`} className="flex-shrink-0">
                      <div className="relative w-32 h-24 bg-gray-100 rounded overflow-hidden">
                        <Image src={post.featuredImage} alt={post?.featuredImageAlt ?? ''} fill className="object-cover" sizes="128px" />
                      </div>
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                      <Link href={`/blog/${post?.slug ?? ''}`}>{post?.title ?? 'Untitled'}</Link>
                    </h2>
                    {post?.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{truncate(post.excerpt, 150)}</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      {post?.author?.name && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author.name}</span>}
                      {post?.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className="hidden lg:block">
          
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
