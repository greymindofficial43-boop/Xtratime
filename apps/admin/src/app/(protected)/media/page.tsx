'use client';

import { adminApi, type MediaFile } from '@/lib/api';
import Image from 'next/image';
import React, { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from 'react';

const LIMIT = 40;

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
      style={{ background: 'var(--admin-accent)', color: '#fff' }}
    >
      {copied ? '✓ Copied' : 'Copy URL'}
    </button>
  );
}

function DetailPanel({
  file,
  onClose,
  onDelete,
}: {
  file: MediaFile;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isImage = file.mimeType.startsWith('image/');

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      await adminApi.deleteMedia(file.id);
      onDelete(file.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <aside
      className="flex flex-col border-l overflow-y-auto"
      style={{
        width: 280,
        minWidth: 280,
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--admin-border)' }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--admin-muted)' }}>
          File Details
        </span>
        <button
          onClick={onClose}
          className="rounded p-1 text-sm transition hover:opacity-70"
          style={{ color: 'var(--admin-muted)' }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Preview */}
      <div
        className="flex items-center justify-center border-b p-4"
        style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}
      >
        {isImage ? (
          <div className="relative h-40 w-full overflow-hidden rounded-lg">
            <Image
              src={file.url}
              alt={file.filename}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex h-40 w-full items-center justify-center rounded-lg text-5xl"
            style={{ background: 'var(--admin-border)' }}
          >
            🎬
          </div>
        )}
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-0 divide-y px-4 py-2" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
        {[
          { label: 'Filename', value: file.filename },
          { label: 'Type',     value: file.mimeType },
          { label: 'Size',     value: formatBytes(file.size) },
          ...(file.width && file.height
            ? [{ label: 'Dimensions', value: `${file.width} × ${file.height}` }]
            : []),
          { label: 'Uploaded', value: formatDate(file.createdAt) },
        ].map(({ label, value }) => (
          <div key={label} className="py-2.5">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--admin-muted)' }}>
              {label}
            </p>
            <p className="break-all text-xs font-medium" style={{ color: 'var(--admin-text)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* URL copy */}
      <div className="px-4 pb-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--admin-muted)' }}>
          URL
        </p>
        <div className="flex gap-2 items-start">
          <input
            readOnly
            value={file.url}
            className="min-w-0 flex-1 rounded-md border px-2.5 py-1.5 text-xs font-mono"
            style={{
              background: 'var(--admin-bg)',
              borderColor: 'var(--admin-border)',
              color: 'var(--admin-text)',
            }}
          />
          <CopyButton text={file.url} />
        </div>
      </div>

      {/* Delete */}
      <div className="mt-auto border-t px-4 py-4" style={{ borderColor: 'var(--admin-border)' }}>
        {confirming ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-md py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
              style={{ background: '#dc2626' }}
            >
              {deleting ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:opacity-70"
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="w-full rounded-md border py-1.5 text-xs font-semibold transition hover:opacity-70"
            style={{ borderColor: '#dc2626', color: '#dc2626' }}
          >
            Delete permanently
          </button>
        )}
      </div>
    </aside>
  );
}

export default function MediaLibraryPage() {
  const [items, setItems]       = useState<MediaFile[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async (p: number, q: string, t: string, replace = false) => {
    setLoading(true);
    try {
      const res = await adminApi.getMedia({ search: q || undefined, mimeType: t || undefined, page: p, limit: LIMIT });
      setItems(prev => replace ? res.items : [...prev, ...res.items]);
      setTotal(res.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, '', '', true);
  }, [load]);

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val, typeFilter, true), 400);
  }

  function handleTypeChange(t: string) {
    setTypeFilter(t);
    load(1, search, t, true);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await adminApi.uploadFile(file);
      }
      await load(1, search, typeFilter, true);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDelete(id: string) {
    setItems(prev => prev.filter(f => f.id !== id));
    setTotal(prev => prev - 1);
    if (selected?.id === id) setSelected(null);
  }

  const hasMore = items.length < total;

  return (
    <div className="flex h-full flex-col gap-0" style={{ minHeight: 0 }}>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black" style={{ color: 'var(--admin-text)' }}>Media Library</h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--admin-muted)' }}>
            {total} file{total !== 1 ? 's' : ''} — all images and videos uploaded to the portals
          </p>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-xl px-4 py-2 text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90"
          style={{ background: 'var(--admin-accent)' }}
        >
          {uploading ? '⟳ Uploading…' : '↑ Upload Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Toolbar */}
      <div
        className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border p-3"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <input
          type="search"
          placeholder="Search by filename…"
          value={search}
          onChange={handleSearchChange}
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--admin-bg)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text)',
          }}
        />
        <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--admin-border)' }}>
          {[
            { label: 'All', value: '' },
            { label: 'Images', value: 'image/' },
            { label: 'Videos', value: 'video/' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className="rounded-md px-3 py-1 text-xs font-semibold transition"
              style={{
                background: typeFilter === opt.value ? 'var(--admin-accent)' : 'transparent',
                color: typeFilter === opt.value ? '#fff' : 'var(--admin-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--admin-border)' }}>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: 'var(--admin-bg)' }}>

          {/* Drag-drop upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed py-5 text-sm font-medium transition"
            style={{
              borderColor: dragOver ? 'var(--admin-accent)' : 'var(--admin-border)',
              color: dragOver ? 'var(--admin-accent)' : 'var(--admin-muted)',
              background: dragOver ? 'color-mix(in srgb, var(--admin-accent) 5%, transparent)' : 'transparent',
            }}
          >
            {uploading
              ? '⟳ Uploading…'
              : dragOver
                ? 'Drop files here'
                : '↑ Drag & drop files here, or click to upload'}
          </div>

          {/* Image grid */}
          {items.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl opacity-20">🖼</span>
              <p className="mt-3 text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>
                {search || typeFilter ? 'No files match your search.' : 'No files yet. Upload some images to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {items.map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelected(prev => prev?.id === file.id ? null : file)}
                  className="group relative overflow-hidden rounded-xl border-2 text-left transition focus:outline-none"
                  style={{
                    borderColor: selected?.id === file.id ? 'var(--admin-accent)' : 'var(--admin-border)',
                    background: 'var(--admin-surface)',
                    boxShadow: selected?.id === file.id ? '0 0 0 2px var(--admin-accent)' : undefined,
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full overflow-hidden" style={{ background: 'var(--admin-border)' }}>
                    {file.mimeType.startsWith('image/') ? (
                      <Image
                        src={file.url}
                        alt={file.filename}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        unoptimized
                        sizes="160px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl opacity-60">🎬</div>
                    )}
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-end opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
                    >
                      <span className="truncate px-2 pb-1.5 text-[10px] font-medium text-white">
                        {file.filename}
                      </span>
                    </div>
                    {/* Selection checkmark */}
                    {selected?.id === file.id && (
                      <div
                        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                        style={{ background: 'var(--admin-accent)' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  {/* Filename label */}
                  <div className="px-2 py-1.5">
                    <p className="truncate text-[10px] font-medium" style={{ color: 'var(--admin-muted)' }}>
                      {file.filename}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Load more */}
          {(hasMore || loading) && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => load(page + 1, search, typeFilter)}
                disabled={loading}
                className="rounded-xl border px-6 py-2.5 text-sm font-semibold transition hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
              >
                {loading ? 'Loading…' : `Load more (${total - items.length} remaining)`}
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            file={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
