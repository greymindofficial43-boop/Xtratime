'use client';

import { adminApi, type MediaFile } from '@/lib/api';
import Image from 'next/image';
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const LIMIT = 40;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with selected URLs. Array is always length 1 unless multiple=true. */
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

export function MediaPickerModal({ open, onClose, onSelect, multiple = false }: Props) {
  const [items, setItems]         = useState<MediaFile[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const searchTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  // Reset and load fresh when modal opens
  useEffect(() => {
    if (!open) return;
    setItems([]);
    setTotal(0);
    setPage(1);
    setSearch('');
    setTypeFilter('');
    setSelected(new Set());
    load(1, '', '', true);
  }, [open, load]);

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

  function toggleSelect(url: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (!multiple) next.clear();
        next.add(url);
      }
      return next;
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await adminApi.uploadFile(file);
        urls.push(res.url);
      }
      await load(1, search, typeFilter, true);
      // Auto-select newly uploaded files
      setSelected(prev => {
        const next = multiple ? new Set(prev) : new Set<string>();
        urls.forEach(u => next.add(u));
        return next;
      });
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function confirm() {
    if (selected.size === 0) return;
    onSelect(Array.from(selected));
    onClose();
  }

  const hasMore = items.length < total;

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative m-4 flex flex-1 flex-col overflow-hidden rounded-2xl md:m-8"
        style={{ background: 'var(--admin-bg)', maxHeight: 'calc(100vh - 4rem)' }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-5 py-4"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>
              Media Library
            </h2>
            {multiple && selected.size > 0 && (
              <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                {selected.size} selected
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-sm transition hover:opacity-70"
            style={{ color: 'var(--admin-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="flex shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          <input
            type="search"
            placeholder="Search by filename…"
            value={search}
            onChange={handleSearchChange}
            className="min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-sm"
            style={{
              background: 'var(--admin-bg)',
              borderColor: 'var(--admin-border)',
              color: 'var(--admin-text)',
            }}
          />
          <div className="flex gap-1 rounded-lg border p-0.5" style={{ borderColor: 'var(--admin-border)' }}>
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
            style={{ background: 'var(--admin-accent)' }}
          >
            {uploading ? '⟳ Uploading…' : '↑ Upload new'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept="image/*,video/*"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {/* Grid */}
        <div
          className="flex-1 overflow-y-auto p-5"
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {/* Drop hint */}
          {dragOver && (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-4 border-dashed text-lg font-bold"
              style={{ borderColor: 'var(--admin-accent)', color: 'var(--admin-accent)', background: 'rgba(0,0,0,0.4)' }}
            >
              Drop to upload
            </div>
          )}

          {items.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl opacity-20">🖼</span>
              <p className="mt-3 text-sm" style={{ color: 'var(--admin-muted)' }}>
                {search || typeFilter ? 'No files match your search.' : 'No files yet. Upload some images to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
              {items.map(file => {
                const isSelected = selected.has(file.url);
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => toggleSelect(file.url)}
                    className="group relative overflow-hidden rounded-xl border-2 text-left transition focus:outline-none"
                    style={{
                      borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                      background: 'var(--admin-surface)',
                      boxShadow: isSelected ? '0 0 0 2px var(--admin-accent)' : undefined,
                    }}
                  >
                    <div className="relative aspect-square w-full overflow-hidden" style={{ background: 'var(--admin-border)' }}>
                      {file.mimeType.startsWith('image/') ? (
                        <Image
                          src={file.url}
                          alt={file.filename}
                          fill
                          className="object-cover transition group-hover:scale-105"
                          unoptimized
                          sizes="140px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl opacity-60">🎬</div>
                      )}
                      {/* Hover overlay with filename */}
                      <div
                        className="absolute inset-0 flex items-end opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
                      >
                        <span className="truncate px-1.5 pb-1 text-[10px] font-medium text-white">
                          {file.filename}
                        </span>
                      </div>
                      {/* Selection checkmark */}
                      {isSelected && (
                        <div
                          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                          style={{ background: 'var(--admin-accent)' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {(hasMore || loading) && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => load(page + 1, search, typeFilter)}
                disabled={loading}
                className="rounded-xl border px-6 py-2 text-sm font-semibold transition hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
              >
                {loading ? 'Loading…' : `Load more (${total - items.length} remaining)`}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 items-center justify-between border-t px-5 py-4"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>
            {total} file{total !== 1 ? 's' : ''} in library
            {multiple && ' · hold Ctrl/Cmd or just click multiple thumbnails to select more than one'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-70"
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={selected.size === 0}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:opacity-40"
              style={{ background: 'var(--admin-accent)' }}
            >
              {selected.size === 0
                ? 'Select an image'
                : multiple
                  ? `Insert ${selected.size} image${selected.size > 1 ? 's' : ''}`
                  : 'Insert image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
