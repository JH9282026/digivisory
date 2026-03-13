import HeaderNav from './header-nav';

interface Props {
  siteName: string;
  tagline: string;
  menuItems: { label: string; url: string }[];
}

export default function PublicHeader({ siteName, tagline, menuItems }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 py-3">
        <HeaderNav siteName={siteName} tagline={tagline} menuItems={menuItems} />
      </div>
    </header>
  );
}
