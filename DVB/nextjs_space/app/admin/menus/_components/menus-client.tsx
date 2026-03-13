'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, GripVertical, Menu as MenuIcon } from 'lucide-react';

interface MenuItem { label: string; url: string; target: string; }

export default function MenusClient() {
  const [headerItems, setHeaderItems] = useState<MenuItem[]>([]);
  const [footerItems, setFooterItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/menus').then(r => r.json()).then(data => {
      const menus = data?.menus ?? [];
      const header = menus.find((m: any) => m?.location === 'header');
      const footer = menus.find((m: any) => m?.location === 'footer');
      if (header?.items) setHeaderItems(header.items.map((i: any) => ({ label: i?.label ?? '', url: i?.url ?? '', target: i?.target ?? '_self' })));
      if (footer?.items) setFooterItems(footer.items.map((i: any) => ({ label: i?.label ?? '', url: i?.url ?? '', target: i?.target ?? '_self' })));
    }).catch(console.error);
  }, []);

  const saveMenu = async (location: string, items: MenuItem[]) => {
    setSaving(true);
    try {
      await fetch('/api/menus', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: location === 'header' ? 'Header Menu' : 'Footer Menu', location, items }) });
    } catch (e) { console.error(e); alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const MenuBuilder = ({ title, items, setItems, location }: { title: string; items: MenuItem[]; setItems: (items: MenuItem[]) => void; location: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><MenuIcon size={18} /> {title}</h2>
        <button onClick={() => saveMenu(location, items)} disabled={saving}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50">
          <Save size={14} /> Save
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <GripVertical size={16} className="text-gray-400 cursor-grab" />
            <input type="text" value={item.label} onChange={e => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n); }}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm outline-none" placeholder="Label" />
            <input type="text" value={item.url} onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; setItems(n); }}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm outline-none" placeholder="/url" />
            <select value={item.target} onChange={e => { const n = [...items]; n[i] = { ...n[i], target: e.target.value }; setItems(n); }}
              className="px-2 py-1.5 border border-gray-200 rounded text-sm outline-none">
              <option value="_self">Same tab</option><option value="_blank">New tab</option>
            </select>
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => setItems([...items, { label: '', url: '/', target: '_self' }])}
          className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition flex items-center justify-center gap-1.5">
          <Plus size={14} /> Add Item
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Navigation Menus</h1>
      <div className="space-y-6">
        <MenuBuilder title="Header Navigation" items={headerItems} setItems={setHeaderItems} location="header" />
        <MenuBuilder title="Footer Navigation" items={footerItems} setItems={setFooterItems} location="footer" />
      </div>
    </div>
  );
}
