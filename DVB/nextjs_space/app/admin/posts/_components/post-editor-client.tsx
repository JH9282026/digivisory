'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, ArrowLeft, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { slugify, seoScore } from '@/lib/utils';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./rich-text-editor'), { ssr: false, loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" /> });
const MarkdownEditor = dynamic(() => import('./markdown-editor'), { ssr: false, loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" /> });

interface PostData {
  title: string;
  slug: string;
  content: string;
  contentType: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  status: string;
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
  metaRobots: string;
  canonicalUrl: string;
  ogImage: string;
  focusKeyword: string;
  schemaType: string;
  categoryIds: string[];
  tagIds: string[];
}

const defaultPost: PostData = {
  title: '', slug: '', content: '', contentType: 'richtext', excerpt: '',
  featuredImage: '', featuredImageAlt: '', status: 'draft', scheduledAt: '',
  metaTitle: '', metaDescription: '', metaRobots: 'index, follow', canonicalUrl: '',
  ogImage: '', focusKeyword: '', schemaType: 'BlogPosting', categoryIds: [], tagIds: [],
};

export default function PostEditorClient({ postId }: { postId?: string }) {
  const [post, setPost] = useState<PostData>(defaultPost);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const [showSeo, setShowSeo] = useState(true);
  const [showMeta, setShowMeta] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d?.categories ?? [])).catch(console.error);
    fetch('/api/tags').then(r => r.json()).then(d => setTags(d?.tags ?? [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/posts/${postId}`)
      .then(r => r.json())
      .then(d => {
        if (d?.id) {
          setPost({
            title: d.title ?? '', slug: d.slug ?? '', content: d.content ?? '',
            contentType: d.contentType ?? 'richtext', excerpt: d.excerpt ?? '',
            featuredImage: d.featuredImage ?? '', featuredImageAlt: d.featuredImageAlt ?? '',
            status: d.status ?? 'draft', scheduledAt: d.scheduledAt ?? '',
            metaTitle: d.metaTitle ?? '', metaDescription: d.metaDescription ?? '',
            metaRobots: d.metaRobots ?? 'index, follow', canonicalUrl: d.canonicalUrl ?? '',
            ogImage: d.ogImage ?? '', focusKeyword: d.focusKeyword ?? '',
            schemaType: d.schemaType ?? 'BlogPosting',
            categoryIds: d.categories?.map((c: any) => c?.categoryId) ?? [],
            tagIds: d.tags?.map((t: any) => t?.tagId) ?? [],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const updateField = useCallback((field: keyof PostData, value: unknown) => {
    setPost(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async (status?: string) => {
    setSaving(true);
    try {
      const payload = { ...post, status: status ?? post.status, slug: post.slug || slugify(post.title) };
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        if (!postId && data?.id) router.replace(`/admin/posts/${data.id}`);
      } else {
        alert(data?.error ?? 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const seo = seoScore(post);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/posts')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold text-gray-900">{postId ? 'Edit Post' : 'New Post'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('draft')} disabled={saving}
            className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
            <Save size={18} /> {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text" placeholder="Post title" value={post.title}
            onChange={e => { updateField('title', e.target.value); if (!postId) updateField('slug', slugify(e.target.value)); }}
            className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:border-indigo-500 outline-none bg-transparent"
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Slug:</span>
            <input type="text" value={post.slug} onChange={e => updateField('slug', slugify(e.target.value))}
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>

          {/* Editor Type Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['richtext', 'markdown', 'html'].map(t => (
              <button key={t} onClick={() => updateField('contentType', t)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${post.contentType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                {t === 'richtext' ? 'Rich Text' : t === 'markdown' ? 'Markdown' : 'HTML'}
              </button>
            ))}
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
            {post.contentType === 'richtext' && (
              <RichTextEditor content={post.content} onChange={(val: string) => updateField('content', val)} />
            )}
            {post.contentType === 'markdown' && (
              <MarkdownEditor content={post.content} onChange={(val: string) => updateField('content', val)} />
            )}
            {post.contentType === 'html' && (
              <textarea value={post.content} onChange={e => updateField('content', e.target.value)}
                className="w-full h-[500px] p-4 font-mono text-sm border-0 outline-none resize-none" placeholder="<h2>Your HTML content...</h2>" />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt / Summary</label>
            <textarea value={post.excerpt} onChange={e => updateField('excerpt', e.target.value)}
              className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write a concise summary for AEO and meta description..." />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SEO Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <button onClick={() => setShowSeo(!showSeo)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-indigo-600" />
                <span className="font-semibold text-gray-900">SEO Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${seo.score >= 70 ? 'text-green-600' : seo.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{seo.score}%</span>
                {showSeo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>
            {showSeo && (
              <div className="mt-3 space-y-2">
                {seo.checks.map((check, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs ${check.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {check.passed ? '✓' : '✗'}
                    </span>
                    <div>
                      <span className="text-gray-700">{check.label}</span>
                      {!check.passed && <p className="text-xs text-gray-400">{check.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Focus Keyword */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keyword</label>
            <input type="text" value={post.focusKeyword} onChange={e => updateField('focusKeyword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., SEO best practices" />
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {categories.map(cat => (
                <label key={cat?.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={post.categoryIds.includes(cat?.id)}
                    onChange={e => {
                      if (e.target.checked) updateField('categoryIds', [...post.categoryIds, cat.id]);
                      else updateField('categoryIds', post.categoryIds.filter((id: string) => id !== cat.id));
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span>{cat?.name}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {tags.map(tag => (
                <label key={tag?.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={post.tagIds.includes(tag?.id)}
                    onChange={e => {
                      if (e.target.checked) updateField('tagIds', [...post.tagIds, tag.id]);
                      else updateField('tagIds', post.tagIds.filter((id: string) => id !== tag.id));
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span>{tag?.name}</span>
                </label>
              ))}
              {tags.length === 0 && <p className="text-sm text-gray-400">No tags yet</p>}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
            <input type="text" value={post.featuredImage} onChange={e => updateField('featuredImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 mb-2" placeholder="https://i.ytimg.com/vi/LyjNbsfWlk4/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCg-WoTeHUJxk393u8AwW6wgC4bng" />
            {post.featuredImage && (
              <img src={post.featuredImage} alt={post.featuredImageAlt || 'Preview'} className="w-full h-32 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <input type="text" value={post.featuredImageAlt} onChange={e => updateField('featuredImageAlt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 mt-2" placeholder="Alt text for image" />
          </div>

          {/* Meta / SEO Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <button onClick={() => setShowMeta(!showMeta)} className="flex items-center justify-between w-full">
              <span className="font-semibold text-gray-900 text-sm">Meta Settings</span>
              {showMeta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showMeta && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title ({(post.metaTitle ?? '').length}/60)</label>
                  <input type="text" value={post.metaTitle} onChange={e => updateField('metaTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description ({(post.metaDescription ?? '').length}/160)</label>
                  <textarea value={post.metaDescription} onChange={e => updateField('metaDescription', e.target.value)}
                    className="w-full h-20 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Robots Meta</label>
                  <select value={post.metaRobots} onChange={e => updateField('metaRobots', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="index, follow">Index, Follow</option>
                    <option value="noindex, follow">Noindex, Follow</option>
                    <option value="index, nofollow">Index, Nofollow</option>
                    <option value="noindex, nofollow">Noindex, Nofollow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Canonical URL</label>
                  <input type="text" value={post.canonicalUrl} onChange={e => updateField('canonicalUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Leave empty for auto" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Schema Type</label>
                  <select value={post.schemaType} onChange={e => updateField('schemaType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="BlogPosting">BlogPosting</option>
                    <option value="Article">Article</option>
                    <option value="WebPage">WebPage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">OG Image URL</label>
                  <input type="text" value={post.ogImage} onChange={e => updateField('ogImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Schedule Publishing</label>
                  <input type="datetime-local" value={post.scheduledAt} onChange={e => updateField('scheduledAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
