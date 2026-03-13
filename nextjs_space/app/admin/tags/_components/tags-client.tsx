'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Save, X, Tags as TagsIcon } from 'lucide-react';

export default function TagsClient() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch('/api/tags'); const data = await res.json(); setTags(data?.tags ?? []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setName(''); fetchTags();
  };

  const handleUpdate = async (id: string) => {
    await fetch(`/api/tags/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName }) });
    setEditId(null); fetchTags();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    await fetch(`/api/tags/${id}`, { method: 'DELETE' }); fetchTags();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Plus size={18} /> Add Tag</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tag name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">Add Tag</button>
          </form>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200">
            {loading ? <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>
            : tags.length === 0 ? <div className="p-8 text-center text-gray-400"><TagsIcon size={32} className="mx-auto mb-2" />No tags yet</div>
            : <div className="flex flex-wrap gap-2 p-4">
              {tags.map(tag => (
                <div key={tag?.id} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2 group hover:bg-indigo-50 transition">
                  {editId === tag?.id ? (
                    <>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="px-2 py-1 border rounded text-sm w-24 outline-none" />
                      <button onClick={() => handleUpdate(tag.id)} className="text-indigo-600"><Save size={14} /></button>
                      <button onClick={() => setEditId(null)} className="text-gray-400"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-700">{tag?.name}</span>
                      <span className="text-xs text-gray-400">({tag?._count?.posts ?? 0})</span>
                      <button onClick={() => { setEditId(tag.id); setEditName(tag.name); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600"><Edit size={12} /></button>
                      <button onClick={() => handleDelete(tag.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
