'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered,
  Quote, Code, Heading1, Heading2, Heading3, Link as LinkIcon, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Minus
} from 'lucide-react';

interface Props {
  content: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your content...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: content || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed?.getHTML?.() ?? '');
    },
    editorProps: {
      attributes: { class: 'prose max-w-none' },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, []);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded hover:bg-gray-200 transition ${active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}>
      {children}
    </button>
  );

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) editor?.chain?.()?.focus?.()?.setImage?.({ src: url })?.run?.();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) editor?.chain?.()?.focus?.()?.setLink?.({ href: url })?.run?.();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleBold?.()?.run?.()} active={editor?.isActive?.('bold')} title="Bold"><Bold size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleItalic?.()?.run?.()} active={editor?.isActive?.('italic')} title="Italic"><Italic size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleUnderline?.()?.run?.()} active={editor?.isActive?.('underline')} title="Underline"><UnderlineIcon size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleStrike?.()?.run?.()} active={editor?.isActive?.('strike')} title="Strikethrough"><Strikethrough size={16} /></ToolBtn>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleHeading?.({ level: 1 })?.run?.()} active={editor?.isActive?.('heading', { level: 1 })} title="H1"><Heading1 size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleHeading?.({ level: 2 })?.run?.()} active={editor?.isActive?.('heading', { level: 2 })} title="H2"><Heading2 size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleHeading?.({ level: 3 })?.run?.()} active={editor?.isActive?.('heading', { level: 3 })} title="H3"><Heading3 size={16} /></ToolBtn>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleBulletList?.()?.run?.()} active={editor?.isActive?.('bulletList')} title="Bullet List"><List size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleOrderedList?.()?.run?.()} active={editor?.isActive?.('orderedList')} title="Ordered List"><ListOrdered size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleBlockquote?.()?.run?.()} active={editor?.isActive?.('blockquote')} title="Blockquote"><Quote size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.toggleCodeBlock?.()?.run?.()} active={editor?.isActive?.('codeBlock')} title="Code Block"><Code size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.setHorizontalRule?.()?.run?.()} title="Horizontal Rule"><Minus size={16} /></ToolBtn>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.setTextAlign?.('left')?.run?.()} active={editor?.isActive?.({ textAlign: 'left' })} title="Align Left"><AlignLeft size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.setTextAlign?.('center')?.run?.()} active={editor?.isActive?.({ textAlign: 'center' })} title="Align Center"><AlignCenter size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.setTextAlign?.('right')?.run?.()} active={editor?.isActive?.({ textAlign: 'right' })} title="Align Right"><AlignRight size={16} /></ToolBtn>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolBtn onClick={addLink} active={editor?.isActive?.('link')} title="Link"><LinkIcon size={16} /></ToolBtn>
        <ToolBtn onClick={addImage} title="Image"><ImageIcon size={16} /></ToolBtn>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.undo?.()?.run?.()} title="Undo"><Undo size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor?.chain?.()?.focus?.()?.redo?.()?.run?.()} title="Redo"><Redo size={16} /></ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
