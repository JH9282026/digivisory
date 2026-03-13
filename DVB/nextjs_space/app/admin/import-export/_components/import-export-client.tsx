'use client';
import { useState } from 'react';
import { Download, Upload, FileText, File } from 'lucide-react';

export default function ImportExportClient() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  const handleExport = async (type: string, format: string) => {
    try {
      const res = await fetch(`/api/export?type=${type}&format=${format}`);
      if (format === 'xml') {
        const text = await res.text();
        const blob = new Blob([text], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${type}-export.xml`; a.click();
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${type}-export.json`; a.click();
      }
    } catch (e) { console.error(e); alert('Export failed'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportResult('');
    try {
      const text = await file.text();
      let items: any[] = [];
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        items = Array.isArray(data) ? data : (data?.posts ?? data?.pages ?? []);
      } else {
        // Simple XML parsing for WordPress format
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/xml');
        const itemElements = doc.querySelectorAll('item');
        itemElements.forEach(el => {
          items.push({
            title: el.querySelector('title')?.textContent ?? '',
            content: el.querySelector('content\\:encoded, encoded')?.textContent ?? '',
            excerpt: el.querySelector('excerpt\\:encoded')?.textContent ?? '',
            slug: el.querySelector('wp\\:post_name, post_name')?.textContent ?? '',
            status: el.querySelector('wp\\:status, status')?.textContent ?? 'draft',
            pubDate: el.querySelector('pubDate')?.textContent ?? '',
          });
        });
      }
      const res = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, type }) });
      const data = await res.json();
      setImportResult(`Imported ${data?.imported ?? 0} of ${data?.total ?? 0} items`);
    } catch (e) { console.error(e); setImportResult('Import failed'); }
    finally { setImporting(false); e.target.value = ''; }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import / Export</h1>
      {importResult && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6">{importResult}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Download size={20} /> Export</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <span className="text-sm font-medium flex-1">Posts</span>
              <button onClick={() => handleExport('posts', 'json')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">JSON</button>
              <button onClick={() => handleExport('posts', 'xml')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100">WP XML</button>
            </div>
            <div className="flex items-center gap-2">
              <File size={16} className="text-indigo-600" />
              <span className="text-sm font-medium flex-1">Pages</span>
              <button onClick={() => handleExport('pages', 'json')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">JSON</button>
              <button onClick={() => handleExport('pages', 'xml')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100">WP XML</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Upload size={20} /> Import</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Import Posts (JSON or WordPress XML)</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 cursor-pointer">
                <Upload size={14} /> {importing ? 'Importing...' : 'Choose File'}
                <input type="file" accept=".json,.xml" onChange={e => handleImport(e, 'posts')} className="hidden" disabled={importing} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Import Pages (JSON or WordPress XML)</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 cursor-pointer">
                <Upload size={14} /> {importing ? 'Importing...' : 'Choose File'}
                <input type="file" accept=".json,.xml" onChange={e => handleImport(e, 'pages')} className="hidden" disabled={importing} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
