'use client';
import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Globe, Palette, Code, Shield } from 'lucide-react';

export default function SettingsClient() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d ?? {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      alert('Settings saved!');
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const update = (key: string, value: unknown) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'ads', label: 'Ads & Code', icon: Code },
    { id: 'robots', label: 'Robots.txt', icon: Shield },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => { const Icon = t.icon; return (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition ${tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            <Icon size={16} /> {t.label}
          </button>
        ); })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {tab === 'general' && (
          <div className="space-y-4 max-w-2xl">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input type="text" value={settings?.siteName ?? ''} onChange={e => update('siteName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input type="text" value={settings?.tagline ?? ''} onChange={e => update('tagline', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <input type="text" value={settings?.siteUrl ?? ''} onChange={e => update('siteUrl', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://yourdomain.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input type="text" value={settings?.logoUrl ?? ''} onChange={e => update('logoUrl', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input type="text" value={settings?.socialTwitter ?? ''} onChange={e => update('socialTwitter', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input type="text" value={settings?.socialFacebook ?? ''} onChange={e => update('socialFacebook', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input type="text" value={settings?.socialLinkedin ?? ''} onChange={e => update('socialLinkedin', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input type="text" value={settings?.socialGithub ?? ''} onChange={e => update('socialGithub', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>
        )}
        {tab === 'seo' && (
          <div className="space-y-4 max-w-2xl">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Title</label>
              <input type="text" value={settings?.defaultMetaTitle ?? ''} onChange={e => update('defaultMetaTitle', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
              <textarea value={settings?.defaultMetaDesc ?? ''} onChange={e => update('defaultMetaDesc', e.target.value)} className="w-full h-24 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input type="text" value={settings?.orgName ?? ''} onChange={e => update('orgName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Organization Logo URL</label>
              <input type="text" value={settings?.orgLogoUrl ?? ''} onChange={e => update('orgLogoUrl', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Permalink Structure</label>
              <select value={settings?.permalinkStructure ?? '/{slug}'} onChange={e => update('permalinkStructure', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="/{slug}">/{'{slug}'}</option>
                <option value="/blog/{slug}">/blog/{'{slug}'}</option>
                <option value="/{category}/{slug}">/{'{category}'}/{'{slug}'}</option>
              </select></div>
          </div>
        )}
        {tab === 'theme' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div><label className="font-medium text-gray-700">Enable Right Sidebar</label><p className="text-sm text-gray-400">Show sidebar on blog pages</p></div>
              <button onClick={() => update('enableSidebar', !settings?.enableSidebar)}
                className={`w-12 h-6 rounded-full transition ${settings?.enableSidebar ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings?.enableSidebar ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
              <select value={settings?.colorScheme ?? 'indigo'} onChange={e => update('colorScheme', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none">
                <option value="indigo">Indigo</option><option value="blue">Blue</option><option value="emerald">Emerald</option><option value="rose">Rose</option><option value="violet">Violet</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
              <textarea value={settings?.customCss ?? ''} onChange={e => update('customCss', e.target.value)} className="w-full h-40 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm outline-none" placeholder="/* Custom CSS */" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Custom Head Code</label>
              <textarea value={settings?.customHeadCode ?? ''} onChange={e => update('customHeadCode', e.target.value)} className="w-full h-32 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm outline-none" placeholder="<!-- analytics, fonts, etc -->" /></div>
          </div>
        )}
        {tab === 'ads' && (
          <div className="space-y-4 max-w-2xl">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Header Ad Zone (HTML/iframe)</label>
              <textarea value={settings?.headerAdCode ?? ''} onChange={e => update('headerAdCode', e.target.value)} className="w-full h-32 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm outline-none" placeholder="<div>Ad code...</div>" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Ad Zone (HTML/iframe)</label>
              <textarea value={settings?.sidebarAdCode ?? ''} onChange={e => update('sidebarAdCode', e.target.value)} className="w-full h-32 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Footer Ad Zone (HTML/iframe)</label>
              <textarea value={settings?.footerAdCode ?? ''} onChange={e => update('footerAdCode', e.target.value)} className="w-full h-32 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Form Placeholder (HTML)</label>
              <textarea value={settings?.formCode ?? ''} onChange={e => update('formCode', e.target.value)} className="w-full h-32 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm outline-none" placeholder="Newsletter form, contact form..." /></div>
          </div>
        )}
        {tab === 'robots' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Edit your robots.txt file. This controls which bots can crawl your site.</p>
            <textarea value={settings?.robotsTxt ?? `# Search Engine Crawlers\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\n# AI Search Crawlers\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\n# Default\nUser-agent: *\nDisallow: /admin/\nDisallow: /api/\nAllow: /`}
              onChange={e => update('robotsTxt', e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}
      </div>
    </div>
  );
}
