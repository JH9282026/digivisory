'use client';
import { useState, useEffect } from 'react';
import { FileText, File, FolderTree, Tags, Image as ImageIcon, TrendingUp, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface DashboardData {
  postsCount: number;
  pagesCount: number;
  categoriesCount: number;
  tagsCount: number;
  mediaCount: number;
  publishedPosts: number;
  draftPosts: number;
  recentPosts: { id: string; title: string; status: string; updatedAt: string; author: { name: string } }[];
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const stats = [
    { label: 'Total Posts', value: data?.postsCount ?? 0, icon: FileText, color: 'bg-indigo-50 text-indigo-600', href: '/admin/posts' },
    { label: 'Total Pages', value: data?.pagesCount ?? 0, icon: File, color: 'bg-emerald-50 text-emerald-600', href: '/admin/pages' },
    { label: 'Categories', value: data?.categoriesCount ?? 0, icon: FolderTree, color: 'bg-amber-50 text-amber-600', href: '/admin/categories' },
    { label: 'Tags', value: data?.tagsCount ?? 0, icon: Tags, color: 'bg-purple-50 text-purple-600', href: '/admin/tags' },
    { label: 'Media Files', value: data?.mediaCount ?? 0, icon: ImageIcon, color: 'bg-pink-50 text-pink-600', href: '/admin/media' },
    { label: 'Published', value: data?.publishedPosts ?? 0, icon: Eye, color: 'bg-green-50 text-green-600', href: '/admin/posts?status=published' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your DVB CMS admin panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Clock size={20} /> Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(data?.recentPosts ?? []).length === 0 && (
            <div className="p-8 text-center text-gray-400">No posts yet. Create your first post!</div>
          )}
          {(data?.recentPosts ?? []).map(post => (
            <Link key={post?.id} href={`/admin/posts/${post?.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
              <div>
                <p className="font-medium text-gray-900">{post?.title ?? 'Untitled'}</p>
                <p className="text-sm text-gray-500">by {post?.author?.name ?? 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${post?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {post?.status ?? 'draft'}
                </span>
                <span className="text-sm text-gray-400">{formatDate(post?.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
