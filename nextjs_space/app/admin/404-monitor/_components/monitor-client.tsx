'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Monitor404Client() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/404-log').then(r => r.json()).then(d => setLogs(d?.logs ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><AlertTriangle size={24} /> 404 Error Monitor</h1>
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" /></div>
        : logs.length === 0 ? <div className="p-8 text-center text-gray-400">No 404 errors recorded yet — that&apos;s a good thing!</div>
        : <div className="divide-y divide-gray-50">
          <div className="grid grid-cols-4 gap-4 p-4 text-xs font-medium text-gray-500 uppercase bg-gray-50">
            <div>Path</div><div>Hits</div><div>Last Seen</div><div>Referer</div>
          </div>
          {logs.map(log => (
            <div key={log?.id} className="grid grid-cols-4 gap-4 p-4 text-sm hover:bg-gray-50">
              <div className="font-medium text-gray-900 truncate">{log?.path}</div>
              <div className="text-gray-600">{log?.count ?? 1}</div>
              <div className="text-gray-500">{log?.lastSeen ? new Date(log.lastSeen).toLocaleDateString() : '-'}</div>
              <div className="text-gray-400 truncate">{log?.referer ?? '-'}</div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
