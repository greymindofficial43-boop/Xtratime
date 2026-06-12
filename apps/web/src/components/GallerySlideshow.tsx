'use client';

import { useState } from 'react';
import type { GalleryImage } from '@/lib/api';

export function GallerySlideshow({ images }: { images: GalleryImage[] }) {
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);
  const img = images[current];

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-[var(--sk-border)] bg-black">
      {/* Main image */}
      <div className="relative flex items-center justify-center" style={{ minHeight: 320 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={img.id}
          src={img.url}
          alt={img.caption ?? `Slide ${current + 1}`}
          className="max-h-[70vh] w-full object-contain"
        />

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              ›
            </button>
          </>
        )}

        {/* Counter */}
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* Caption */}
      {img.caption && (
        <div className="bg-[var(--sk-surface)] px-5 py-3 text-sm text-[var(--sk-muted)]">
          {img.caption}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto bg-black/80 p-2 sk-scrollbar-hide">
          {images.map((thumb, i) => (
            <button
              key={thumb.id}
              onClick={() => setCurrent(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded transition ${
                i === current ? 'ring-2 ring-[var(--sk-accent)]' : 'opacity-50 hover:opacity-80'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
