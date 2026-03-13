'use client';
import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';

export default function MediaClient() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState('');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      setMedia(data?.media ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Get presigned URL
        const presignedRes = await fetch('/api/upload/presigned', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
        });
        const { uploadUrl, cloud_storage_path } = await presignedRes.json();
        // Upload to S3
        const headers: Record<string, string> = { 'Content-Type': file.type };
        const urlObj = new URL(uploadUrl);
        const signedHeaders = urlObj.searchParams.get('X-Amz-SignedHeaders') ?? '';
        if (signedHeaders.includes('content-disposition')) {
          headers['Content-Disposition'] = 'attachment';
        }
        await fetch(uploadUrl, { method: 'PUT', headers, body: file });
        // Save record
        await fetch('/api/upload/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloud_storage_path, isPublic: true, fileName: file.name, fileType: file.type, fileSize: file.size }),
        });
      }
      fetchMedia();
    } catch (e) { console.error(e); alert('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    fetchMedia();
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard?.writeText?.(url);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">{media.length} files</p>
        </div>
        <label className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2 cursor-pointer">
          <Upload size={20} /> {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">No media files yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map(m => (
            <div key={m?.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-md transition">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {m?.fileType?.startsWith?.('image') ? (
                  <img src={m?.url ?? ''} alt={m?.altText ?? m?.fileName ?? ''} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="text-center text-gray-400"><ImageIcon size={32} /><p className="text-xs mt-1">{m?.fileType ?? 'file'}</p></div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{m?.fileName ?? 'Unknown'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <button onClick={() => copyUrl(m?.url ?? '', m?.id)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600" title="Copy URL">
                    {copied === m?.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                  <button onClick={() => handleDelete(m?.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
