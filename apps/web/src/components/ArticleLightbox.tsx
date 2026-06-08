'use client';

import { useEffect, useState } from 'react';

/**
 * Makes every <img> inside the article open full-size in an overlay on click.
 * Covers the featured image (which is cropped to 16:9 on the page) and any
 * images inside the article content.
 */
export function ArticleLightbox() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const imgs = Array.from(article.querySelectorAll('img'));
    const cleanups = imgs.map((img) => {
      img.style.cursor = 'zoom-in';
      const handler = () => setSrc(img.currentSrc || img.src);
      img.addEventListener('click', handler);
      return () => img.removeEventListener('click', handler);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    if (!src) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSrc(null);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [src]);

  if (!src) return null;

  return (
    <div
      onClick={() => setSrc(null)}
      className="fixed inset-0 z-[300] flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-h-full max-w-full object-contain" />
      <button
        type="button"
        onClick={() => setSrc(null)}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
