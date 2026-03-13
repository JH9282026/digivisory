'use client';
import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';

export default function ProfileClient() {
  const [user, setUser] = useState<Record<string, any>>({});
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => setUser(d ?? {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...user, ...(password ? { password } : {}) };
      await fetch('/api/user', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      alert('Profile updated!'); setPassword('');
    } catch { alert('Failed to update'); }
    finally { setSaving(false); }
  };

  const update = (key: string, value: string) => setUser(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Author Profile</h1>
        <button onClick={handleSave} disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
          <Save size={18} /> Save
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-4">
        <p className="text-sm text-gray-500 flex items-center gap-2"><User size={16} /> E-E-A-T Author Information — This data feeds into structured data and author schema.</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={user?.name ?? ''} onChange={e => update('name', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input type="text" value={user?.jobTitle ?? ''} onChange={e => update('jobTitle', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Expertise / Specializations</label>
          <input type="text" value={user?.expertise ?? ''} onChange={e => update('expertise', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., SEO, Content Marketing, Web Development" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Credentials / Certifications</label>
          <input type="text" value={user?.credentials ?? ''} onChange={e => update('credentials', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea value={user?.bio ?? ''} onChange={e => update('bio', e.target.value)} className="w-full h-28 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
          <input type="text" value={user?.image ?? ''} onChange={e => update('image', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="text" value={user?.website ?? ''} onChange={e => update('website', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
            <input type="text" value={user?.twitterUrl ?? ''} onChange={e => update('twitterUrl', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input type="text" value={user?.linkedinUrl ?? ''} onChange={e => update('linkedinUrl', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input type="text" value={user?.githubUrl ?? ''} onChange={e => update('githubUrl', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Leave empty to keep current" /></div>
      </div>
    </div>
  );
}
