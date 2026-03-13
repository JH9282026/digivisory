'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PagesListClient() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data?.pages ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    fetchPages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500 mt-1">{pages.length} total pages</p>
        </div>
        <Link href="/admin/pages/new" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2">
          <Plus size={20} /> New Page
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No pages yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pages.map(page => (
              <div key={page?.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div>
                  <Link href={`/admin/pages/${page?.id}`} className="font-medium text-gray-900 hover:text-indigo-600">{page?.title ?? 'Untitled'}</Link>
                  <p className="text-sm text-gray-500 mt-0.5">/{page?.slug} • {formatDate(page?.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${page?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{page?.status ?? 'draft'}</span>
                  <Link href={`/admin/pages/${page?.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><Edit size={16} /></Link>
                  <button onClick={() => handleDelete(page?.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
