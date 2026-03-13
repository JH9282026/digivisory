'use client';
import { useState } from 'react';
import { Eye, Edit } from 'lucide-react';

interface Props {
  content: string;
  onChange: (val: string) => void;
}

export default function MarkdownEditor({ content, onChange }: Props) {
  const [preview, setPreview] = useState(false);

  const renderMarkdown = (md: string) => {
    let html = md ?? '';
    // Basic markdown rendering
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;
    return html;
  };

  return (
    <div>
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <button onClick={() => setPreview(false)} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 ${!preview ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}>
          <Edit size={14} /> Write
        </button>
        <button onClick={() => setPreview(true)} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 ${preview ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}>
          <Eye size={14} /> Preview
        </button>
      </div>
      {preview ? (
        <div className="prose max-w-none p-4 min-h-[400px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      ) : (
        <textarea value={content} onChange={e => onChange(e.target.value)}
          className="w-full h-[500px] p-4 font-mono text-sm border-0 outline-none resize-none"
          placeholder="# Your markdown content..." />
      )}
    </div>
  );
}
