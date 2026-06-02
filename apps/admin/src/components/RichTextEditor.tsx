'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import TextAlignExt from '@tiptap/extension-text-align';
import PlaceholderExt from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/api$/, '');

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function Divider() {
  return <div className="mx-0.5 h-6 w-px bg-slate-200 shrink-0" />;
}

function Btn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 min-w-[32px] items-center justify-center rounded px-2 text-sm font-medium transition-colors shrink-0
        ${active ? 'bg-[var(--admin-accent)] text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      ImageExt.configure({ inline: false, allowBase64: true }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      TextAlignExt.configure({ types: ['heading', 'paragraph'] }),
      PlaceholderExt.configure({ placeholder: 'Start writing your article here...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'rte-content' },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Immediately show base64 preview at cursor
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        editor.chain().focus().setImage({ src: ev.target.result as string, alt: file.name }).run();
      }
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        editor.chain().focus().setImage({ src: `${API_BASE}${data.url}`, alt: file.name }).run();
      }
    } catch { /* keep base64 preview */ } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }

  function applyLink() {
    if (!editor || !linkUrl.trim()) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setShowLink(false);
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1">

        {/* Undo / Redo */}
        <Btn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</Btn>
        <Btn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</Btn>

        <Divider />

        {/* Headings */}
        <Btn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Btn>
        <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Btn title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>¶</Btn>

        <Divider />

        {/* Formatting */}
        <Btn title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></Btn>
        <Btn title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Btn>
        <Btn title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></Btn>
        <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>

        <Divider />

        {/* Alignment */}
        <Btn title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z"/></svg>
        </Btn>
        <Btn title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3zm3 4h12v2H6zm-3 4h18v2H3zm3 4h12v2H6z"/></svg>
        </Btn>
        <Btn title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3zm6 4h12v2H9zm-6 4h18v2H3zm6 4h12v2H9z"/></svg>
        </Btn>

        <Divider />

        {/* Lists */}
        <Btn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zM8 7h13v2H8zm0 5h13v2H8zm0 5h13v2H8z"/></svg>
        </Btn>
        <Btn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6h2v1H3v1h1v1H2V6zm1 5v1h2v1H2v-2h2v-1H2v-1h3v1H3zm1 4H2v1h1v1H2v1h3v-1H3v-1h1v-1zM8 7h13v2H8zm0 5h13v2H8zm0 5h13v2H8z"/></svg>
        </Btn>

        <Divider />

        {/* Blockquote + HR */}
        <Btn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </Btn>
        <Btn title="Horizontal Line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</Btn>

        <Divider />

        {/* Link */}
        <div className="relative">
          <Btn title="Insert Link" active={editor.isActive('link') || showLink} onClick={() => setShowLink((v) => !v)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </Btn>
          {showLink && (
            <div className="absolute left-0 top-9 z-20 flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1.5 shadow-xl">
              <input
                autoFocus
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLink(false); }}
                className="w-52 rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-[var(--admin-accent)]"
              />
              <button type="button" onClick={applyLink} className="rounded bg-[var(--admin-accent)] px-2 py-1 text-xs text-white">Add</button>
              <button type="button" onClick={() => setShowLink(false)} className="text-xs text-slate-400 hover:text-slate-700">✕</button>
            </div>
          )}
        </div>
        <Btn title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/></svg>
        </Btn>

        <Divider />

        {/* Image upload */}
        <Btn title="Insert Image" disabled={uploading} onClick={() => imageInputRef.current?.click()}>
          {uploading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          }
        </Btn>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        <Divider />

        {/* Clear formatting */}
        <Btn title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>✕</Btn>
      </div>

      {/* ── Editor body ── */}
      <EditorContent editor={editor} />

      {/* ── Styles ── */}
      <style>{`
        .rte-content { min-height: 420px; padding: 1.5rem; outline: none; font-size: 0.9rem; line-height: 1.75; color: #1e293b; }
        .rte-content p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; float: left; height: 0; }
        .rte-content h1 { font-size: 1.9rem; font-weight: 800; margin: 1.25rem 0 0.5rem; line-height: 1.2; }
        .rte-content h2 { font-size: 1.45rem; font-weight: 700; margin: 1rem 0 0.4rem; line-height: 1.3; }
        .rte-content h3 { font-size: 1.15rem; font-weight: 600; margin: 0.875rem 0 0.35rem; }
        .rte-content p { margin-bottom: 0.875rem; }
        .rte-content ul { list-style: disc; padding-left: 1.6rem; margin-bottom: 0.875rem; }
        .rte-content ol { list-style: decimal; padding-left: 1.6rem; margin-bottom: 0.875rem; }
        .rte-content li { margin-bottom: 0.3rem; }
        .rte-content blockquote { border-left: 4px solid #e10600; padding: 0.5rem 0 0.5rem 1rem; font-style: italic; color: #64748b; margin: 1rem 0; background: #fef9f9; border-radius: 0 0.25rem 0.25rem 0; }
        .rte-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
        .rte-content a { color: #e10600; text-decoration: underline; }
        .rte-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem auto; display: block; cursor: pointer; border: 2px solid transparent; transition: border-color 0.15s; }
        .rte-content img.ProseMirror-selectednode { border-color: #e10600; box-shadow: 0 0 0 3px #fee2e2; }
        .rte-content strong { font-weight: 700; }
        .rte-content em { font-style: italic; }
        .rte-content u { text-decoration: underline; }
        .rte-content s { text-decoration: line-through; }
        .rte-content .ProseMirror:focus { outline: none; }
        .rte-content [data-text-align=center] { text-align: center; }
        .rte-content [data-text-align=right] { text-align: right; }
        .rte-content [data-text-align=justify] { text-align: justify; }
      `}</style>

      <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
        Rich text editor — Ctrl+B Bold · Ctrl+I Italic · Ctrl+U Underline · Use 🖼 toolbar button to insert images between paragraphs
      </div>
    </div>
  );
}
