'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Save, X, FolderTree } from 'lucide-react';

export default function CategoriesClient() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data?.categories ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) });
    setName(''); setDescription(''); fetchCategories();
  };

  const handleUpdate = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, description: editDesc }) });
    setEditId(null); fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Plus size={18} /> Add Category</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full h-20 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">Add Category</button>
          </form>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-gray-400"><FolderTree size={32} className="mx-auto mb-2" />No categories yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {categories.map(cat => (
                  <div key={cat?.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    {editId === cat?.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="px-2 py-1 border rounded text-sm flex-1 outline-none" />
                        <button onClick={() => handleUpdate(cat.id)} className="p-1.5 bg-indigo-600 text-white rounded"><Save size={14} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 bg-gray-200 rounded"><X size={14} /></button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-900">{cat?.name}</span>
                          <span className="ml-2 text-xs text-gray-400">/{cat?.slug}</span>
                          <span className="ml-2 text-xs text-gray-400">{cat?._count?.posts ?? 0} posts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description ?? ''); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
