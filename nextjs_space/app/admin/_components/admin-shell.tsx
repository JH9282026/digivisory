'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, FileText, File, Image as ImageIcon, FolderTree, Tags,
  Menu as MenuIcon, Settings, ArrowLeftRight, AlertTriangle, Upload, Download,
  User, LogOut, ChevronLeft, ChevronRight, Globe
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/pages', label: 'Pages', icon: File },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/menus', label: 'Menus', icon: MenuIcon },
  { href: '/admin/redirects', label: 'Redirects', icon: ArrowLeftRight },
  { href: '/admin/404-monitor', label: '404 Monitor', icon: AlertTriangle },
  { href: '/admin/import-export', label: 'Import / Export', icon: Download },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/profile', label: 'Profile', icon: User },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-lg text-gray-900">DVB CMS</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-100 rounded">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${isActive(item.href) ? 'active' : 'text-gray-600'}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gray-100 space-y-0.5">
          <Link href="/" target="_blank" className="admin-sidebar-link text-gray-600" title={collapsed ? 'View Site' : undefined}>
            <Globe size={20} />
            {!collapsed && <span>View Site</span>}
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="admin-sidebar-link text-gray-600 w-full" title={collapsed ? 'Logout' : undefined}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
