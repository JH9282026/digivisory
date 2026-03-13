'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export default function RedirectsClient() {
  const [redirects, setRedirects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [type, setType] = useState(301);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch('/api/redirects'); const d = await res.json(); setRedirects(d?.redirects ?? []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath || !toPath) return;
    await fetch('/api/redirects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromPath, toPath, type }) });
    setFromPath(''); setToPath(''); fetch_();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/redirects/${id}`, { method: 'DELETE' }); fetch_();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">301 Redirect Manager</h1>
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-gray-500 mb-1">From Path</label>
          <input type="text" value={fromPath} onChange={e => setFromPath(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="/old-page" /></div>
        <ArrowRight size={20} className="text-gray-400 mb-2" />
        <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-gray-500 mb-1">To Path</label>
          <input type="text" value={toPath} onChange={e => setToPath(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="/new-page" /></div>
        <select value={type} onChange={e => setType(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value={301}>301 Permanent</option><option value={302}>302 Temporary</option><option value={410}>410 Gone</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5"><Plus size={14} /> Add</button>
      </form>
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>
        : redirects.length === 0 ? <div className="p-8 text-center text-gray-400">No redirects configured</div>
        : <div className="divide-y divide-gray-50">
          {redirects.map(r => (
            <div key={r?.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{r?.type}</span>
                <span className="text-sm font-medium text-gray-900">{r?.fromPath}</span>
                <ArrowRight size={16} className="text-gray-400" />
                <span className="text-sm text-indigo-600">{r?.toPath}</span>
                <span className="text-xs text-gray-400">{r?.hits ?? 0} hits</span>
              </div>
              <button onClick={() => handleDelete(r?.id)} className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
