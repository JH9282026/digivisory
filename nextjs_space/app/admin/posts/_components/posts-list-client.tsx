'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';

export default function PostsListClient() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data?.posts ?? []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 mt-1">{total} total posts</p>
        </div>
        <Link href="/admin/posts/new" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2">
          <Plus size={20} /> New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search posts..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No posts found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {posts.map(post => (
              <div key={post?.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0 mr-4">
                  <Link href={`/admin/posts/${post?.id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition">
                    {post?.title ?? 'Untitled'}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{post?.author?.name ?? 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatDate(post?.createdAt)}</span>
                    {post?.categories?.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{post?.categories?.map((c: any) => c?.category?.name)?.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${post?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post?.status ?? 'draft'}
                  </span>
                  {post?.status === 'published' && (
                    <Link href={`/blog/${post?.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="View">
                      <Eye size={16} />
                    </Link>
                  )}
                  <Link href={`/admin/posts/${post?.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(post?.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
