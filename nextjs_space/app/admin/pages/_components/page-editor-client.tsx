'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { slugify } from '@/lib/utils';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('../../posts/_components/rich-text-editor'), { ssr: false, loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" /> });

export default function PageEditorClient({ pageId }: { pageId?: string }) {
  const [page, setPage] = useState({ title: '', slug: '', content: '', contentType: 'richtext', status: 'draft', metaTitle: '', metaDescription: '', metaRobots: 'index, follow', canonicalUrl: '', focusKeyword: '', schemaType: 'WebPage', template: 'default' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!pageId);
  const [showMeta, setShowMeta] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!pageId) return;
    fetch(`/api/pages/${pageId}`).then(r => r.json()).then(d => {
      if (d?.id) setPage({ title: d.title ?? '', slug: d.slug ?? '', content: d.content ?? '', contentType: d.contentType ?? 'richtext', status: d.status ?? 'draft', metaTitle: d.metaTitle ?? '', metaDescription: d.metaDescription ?? '', metaRobots: d.metaRobots ?? 'index, follow', canonicalUrl: d.canonicalUrl ?? '', focusKeyword: d.focusKeyword ?? '', schemaType: d.schemaType ?? 'WebPage', template: d.template ?? 'default' });
    }).catch(console.error).finally(() => setLoading(false));
  }, [pageId]);

  const handleSave = async (status?: string) => {
    setSaving(true);
    try {
      const payload = { ...page, status: status ?? page.status, slug: page.slug || slugify(page.title) };
      const url = pageId ? `/api/pages/${pageId}` : '/api/pages';
      const method = pageId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && !pageId && data?.id) router.replace(`/admin/pages/${data.id}`);
      else if (!res.ok) alert(data?.error ?? 'Failed to save');
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/pages')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold text-gray-900">{pageId ? 'Edit Page' : 'New Page'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('draft')} disabled={saving} className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50">Save Draft</button>
          <button onClick={() => handleSave('published')} disabled={saving} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"><Save size={18} /> Publish</button>
        </div>
      </div>
      <div className="space-y-4">
        <input type="text" placeholder="Page title" value={page.title}
          onChange={e => setPage(p => ({ ...p, title: e.target.value, ...(!pageId ? { slug: slugify(e.target.value) } : {}) }))}
          className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:border-indigo-500 outline-none bg-transparent" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Slug:</span>
          <input type="text" value={page.slug} onChange={e => setPage(p => ({ ...p, slug: slugify(e.target.value) }))}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm outline-none" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
          {page.contentType === 'richtext' ? (
            <RichTextEditor content={page.content} onChange={(val: string) => setPage(p => ({ ...p, content: val }))} />
          ) : (
            <textarea value={page.content} onChange={e => setPage(p => ({ ...p, content: e.target.value }))}
              className="w-full h-[500px] p-4 font-mono text-sm border-0 outline-none resize-none" />
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <button onClick={() => setShowMeta(!showMeta)} className="flex items-center justify-between w-full">
            <span className="font-semibold text-gray-900">SEO & Meta Settings</span>
            {showMeta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showMeta && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                <input type="text" value={page.metaTitle} onChange={e => setPage(p => ({ ...p, metaTitle: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                <input type="text" value={page.metaDescription} onChange={e => setPage(p => ({ ...p, metaDescription: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Robots</label>
                <select value={page.metaRobots} onChange={e => setPage(p => ({ ...p, metaRobots: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none">
                  <option value="index, follow">Index, Follow</option><option value="noindex, follow">Noindex, Follow</option><option value="noindex, nofollow">Noindex, Nofollow</option>
                </select></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Canonical URL</label>
                <input type="text" value={page.canonicalUrl} onChange={e => setPage(p => ({ ...p, canonicalUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
