import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Clock, FolderOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function Sidebar() {
  let recentPosts: { title: string; slug: string; publishedAt: Date | null }[] = [];
  let categories: { id: string; name: string; slug: string; postCount: number }[] = [];
  let adCode = '';

  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: { title: true, slug: true, publishedAt: true },
    });
    recentPosts = posts ?? [];
  } catch {}

  try {
    const cats = await prisma.category.findMany({
      include: { posts: { where: { post: { status: 'PUBLISHED' } } } },
      orderBy: { name: 'asc' },
    });
    categories = (cats ?? []).map((c: any) => ({
      id: c?.id ?? '',
      name: c?.name ?? '',
      slug: c?.slug ?? '',
      postCount: c?.posts?.length ?? 0,
    }));
  } catch {}

  try {
    const settings = await prisma.siteSettings.findFirst();
    adCode = settings?.sidebarAdCode ?? '';
  } catch {}

  return (
    <aside className="space-y-8">
      {/* Recent Posts */}
      <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" /> Recent Posts
        </h3>
        <ul className="space-y-3">
          {(recentPosts ?? []).map((post) => (
            <li key={post?.slug ?? ''}>
              <Link href={`/blog/${post?.slug ?? ''}`} className="text-sm text-gray-700 hover:text-indigo-600 transition-colors line-clamp-2">
                {post?.title ?? 'Untitled'}
              </Link>
              {post?.publishedAt && (
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.publishedAt)}</p>
              )}
            </li>
          ))}
          {(recentPosts?.length ?? 0) === 0 && <li className="text-xs text-gray-400">No posts yet.</li>}
        </ul>
      </div>

      {/* Categories */}
      <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-indigo-500" /> Categories
        </h3>
        <ul className="space-y-2">
          {(categories ?? []).map((cat) => (
            <li key={cat?.id ?? ''}>
              <Link href={`/category/${cat?.slug ?? ''}`} className="text-sm text-gray-700 hover:text-indigo-600 transition-colors flex justify-between">
                <span>{cat?.name ?? ''}</span>
                <span className="text-xs text-gray-400">({cat?.postCount ?? 0})</span>
              </Link>
            </li>
          ))}
          {(categories?.length ?? 0) === 0 && <li className="text-xs text-gray-400">No categories yet.</li>}
        </ul>
      </div>

      {/* Ad Slot */}
      {adCode && (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm" dangerouslySetInnerHTML={{ __html: adCode }} />
      )}
    </aside>
  );
}
