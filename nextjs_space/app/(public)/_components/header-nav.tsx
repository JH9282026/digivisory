'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';

interface Props {
  siteName: string;
  tagline: string;
  menuItems: { label: string; url: string }[];
}

export default function HeaderNav({ siteName, tagline, menuItems }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="flex flex-col">
        <span className="text-xl font-bold text-indigo-600">{siteName || 'DVB'}</span>
        {tagline && <span className="text-xs text-gray-500 hidden sm:block">{tagline}</span>}
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        {(menuItems ?? []).map((item, i) => (
          <Link key={i} href={item?.url ?? '#'} className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            {item?.label ?? ''}
          </Link>
        ))}
        <Link href="/search" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Search">
          <Search className="w-4 h-4 text-gray-600" />
        </Link>
      </nav>

      <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg md:hidden z-50">
          <div className="p-4 flex flex-col gap-3">
            {(menuItems ?? []).map((item, i) => (
              <Link key={i} href={item?.url ?? '#'} className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>
                {item?.label ?? ''}
              </Link>
            ))}
            <Link href="/search" className="text-sm font-medium text-gray-700 py-2 flex items-center gap-2" onClick={() => setOpen(false)}>
              <Search className="w-4 h-4" /> Search
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
