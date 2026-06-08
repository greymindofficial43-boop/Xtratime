'use client';

import { useEffect } from 'react';

export type PreviewData = {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryName: string;
  publishedAt: string; // datetime-local value or ISO
};

function fmt(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ArticlePreview({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: PreviewData;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black/60">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between bg-white px-4 py-2.5 shadow">
        <span className="text-sm font-semibold text-slate-700">
          Preview <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">how it will look</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Close preview
        </button>
      </div>

      {/* Scrollable article */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
        <article className="mx-auto max-w-3xl rounded-xl bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            {data.categoryName && (
              <span className="rounded-full bg-red-600/10 px-2.5 py-0.5 text-xs font-bold text-red-600">
                {data.categoryName}
              </span>
            )}
            {fmt(data.publishedAt) && (
              <span className="text-slate-400">{fmt(data.publishedAt)}</span>
            )}
          </div>

          <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
            {data.title || 'Untitled article'}
          </h1>

          {data.excerpt && (
            <p className="mt-3 text-base font-medium text-slate-500 sm:text-lg">{data.excerpt}</p>
          )}

          {data.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.featuredImage}
              alt=""
              className="mt-5 w-full rounded-xl object-cover"
            />
          )}

          <div
            className="article-preview-content mt-6"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </article>
      </div>

      <style>{`
        .article-preview-content { color: #1f2937; font-size: 1.05rem; line-height: 1.8; }
        .article-preview-content h1 { font-size: 1.8rem; font-weight: 800; margin: 1.4rem 0 0.6rem; }
        .article-preview-content h2 { font-size: 1.45rem; font-weight: 700; margin: 1.3rem 0 0.5rem; }
        .article-preview-content h3 { font-size: 1.2rem; font-weight: 600; margin: 1.1rem 0 0.4rem; }
        .article-preview-content p { margin-bottom: 1.1rem; }
        .article-preview-content ul { list-style: disc; padding-left: 1.6rem; margin-bottom: 1rem; }
        .article-preview-content ol { list-style: decimal; padding-left: 1.6rem; margin-bottom: 1rem; }
        .article-preview-content li { margin-bottom: 0.4rem; }
        .article-preview-content a { color: #e10600; text-decoration: underline; }
        .article-preview-content blockquote { border-left: 4px solid #e10600; padding: 0.6rem 1rem; background: #fef9f9; color: #475569; font-style: italic; margin: 1.3rem 0; border-radius: 0 8px 8px 0; }
        .article-preview-content img { max-width: 100%; height: auto; border-radius: 10px; margin: 1.25rem auto; display: block; }
        .article-preview-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
        .article-preview-content [data-text-align=center] { text-align: center; }
        .article-preview-content [data-text-align=right] { text-align: right; }
      `}</style>
    </div>
  );
}
