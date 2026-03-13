export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate, truncate } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import type { Metadata } from 'next';

interface Props { params: { slug: string } }

async function getTag(slug: string) {
  try {
    return await prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { post: { status: 'PUBLISHED', publishedAt: { lte: new Date() } } },
          include: { post: { select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, readingTime: true } } },
          orderBy: { post: { publishedAt: 'desc' } },
        },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTag(params?.slug ?? '');
  if (!tag) return { title: 'Not Found' };
  return { title: `Tag: ${tag?.name ?? ''}`, description: `Posts tagged with ${tag?.name ?? ''}` };
}

export default async function TagPage({ params }: Props) {
  const tag = await getTag(params?.slug ?? '');
  if (!tag) notFound();

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tag: <span className="text-indigo-600">#{tag?.name ?? ''}</span></h1>
      </header>

      {(tag?.posts?.length ?? 0) === 0 && <p className="text-gray-400">No posts with this tag yet.</p>}
      <div className="space-y-5">
        {(tag?.posts ?? []).map((tp: any) => {
          const post = tp?.post;
          if (!post) return null;
          return (
            <article key={post?.id ?? ''} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                <Link href={`/blog/${post?.slug ?? ''}`}>{post?.title ?? 'Untitled'}</Link>
              </h2>
              {post?.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{truncate(post.excerpt, 160)}</p>}
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                {post?.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}</span>}
                {(post?.readingTime ?? 0) > 0 && <span>{post.readingTime} min read</span>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
