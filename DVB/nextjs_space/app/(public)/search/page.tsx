'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, Loader2 } from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!query?.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/posts?search=${encodeURIComponent(query.trim())}&status=PUBLISHED&limit=20`);
      const data = await res?.json?.();
      setResults(data?.posts ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>
      <div className="flex gap-2 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e?.target?.value ?? '')}
            onKeyDown={(e) => e?.key === 'Enter' && doSearch()}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <button onClick={doSearch} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          Search
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      )}

      {!loading && searched && (results?.length ?? 0) === 0 && (
        <p className="text-center text-gray-400 py-12">No results found for &ldquo;{query}&rdquo;</p>
      )}

      {!loading && (results?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {(results ?? []).map((post: any) => (
            <article key={post?.id ?? ''} className="flex gap-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
              {post?.featuredImage && (
                <Link href={`/blog/${post?.slug ?? ''}`} className="flex-shrink-0">
                  <div className="relative w-24 h-20 bg-gray-100 rounded overflow-hidden">
                    <Image src={post.featuredImage} alt={post?.title ?? ''} fill className="object-cover" sizes="96px" />
                  </div>
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                  <Link href={`/blog/${post?.slug ?? ''}`}>{post?.title ?? 'Untitled'}</Link>
                </h2>
                {post?.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{truncate(post.excerpt, 150)}</p>}
                <div className="mt-2 text-xs text-gray-400 flex gap-2">
                  {post?.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
