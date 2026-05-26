'use client';

import { useEffect, useRef } from 'react';

type ToolbarButton = {
  label: string;
  command: string;
  value?: string;
  icon: string;
};

const TOOLBAR: ToolbarButton[] = [
  { label: 'Bold', command: 'bold', icon: '<strong>B</strong>' },
  { label: 'Italic', command: 'italic', icon: '<em>I</em>' },
  { label: 'Underline', command: 'underline', icon: '<u>U</u>' },
  { label: 'Heading 2', command: 'formatBlock', value: 'H2', icon: 'H2' },
  { label: 'Heading 3', command: 'formatBlock', value: 'H3', icon: 'H3' },
  { label: 'Paragraph', command: 'formatBlock', value: 'P', icon: '¶' },
  { label: 'Unordered List', command: 'insertUnorderedList', icon: '≡' },
  { label: 'Ordered List', command: 'insertOrderedList', icon: '1.' },
  { label: 'Blockquote', command: 'formatBlock', value: 'BLOCKQUOTE', icon: '"' },
  { label: 'Remove Format', command: 'removeFormat', icon: '✕' },
];

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // Sync value into the editor only on mount or external changes
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  function execCmd(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? undefined);
    // Fire onChange after formatting
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }

  function handleInput() {
    if (!isComposing.current && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }

  function handleLink() {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) execCmd('createLink', url);
  }

  return (
    <div className="rounded-lg border border-slate-300 overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5">
        {TOOLBAR.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.label}
            onMouseDown={(e) => {
              e.preventDefault(); // prevent losing focus
              execCmd(btn.command, btn.value);
            }}
            className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            dangerouslySetInnerHTML={{ __html: btn.icon }}
          />
        ))}
        {/* Link button */}
        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => {
            e.preventDefault();
            handleLink();
          }}
          className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          🔗
        </button>
        {/* Unlink */}
        <button
          type="button"
          title="Remove Link"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd('unlink');
          }}
          className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          ⛓️‍💥
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => (isComposing.current = true)}
        onCompositionEnd={() => {
          isComposing.current = false;
          handleInput();
        }}
        className="min-h-[320px] p-4 text-sm leading-relaxed text-slate-800 outline-none focus:outline-none
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
          [&_p]:mb-2 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
          [&_li]:mb-0.5
          [&_blockquote]:border-l-4 [&_blockquote]:border-red-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-3
          [&_a]:text-red-600 [&_a]:underline
          [&_strong]:font-bold [&_em]:italic [&_u]:underline"
        style={{ minHeight: '320px' }}
      />

      <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
        Use the toolbar to format text. Content is saved as HTML.
      </div>
    </div>
  );
}
