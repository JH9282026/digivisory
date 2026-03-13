import Link from 'next/link';

interface Props {
  siteName: string;
  menuItems: { label: string; url: string }[];
}

export default function PublicFooter({ siteName, menuItems }: Props) {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-12">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 {siteName || 'DVB Blog'}. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            {(menuItems ?? []).map((item, i) => (
              <Link key={i} href={item?.url ?? '#'} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                {item?.label ?? ''}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
