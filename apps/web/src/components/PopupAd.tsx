'use client';

import { useEffect, useState } from 'react';
import { api, type PopupAd as PopupAdType } from '@/lib/api';

// Dismissal is remembered per ad + its last-updated time, so editing an ad in
// the admin makes it show again even to visitors who closed the old version.
const dismissKey = (ad: PopupAdType) => `popupad:${ad.id}:${ad.updatedAt ?? ''}`;

function wasDismissed(ad: PopupAdType): boolean {
  try {
    return localStorage.getItem(dismissKey(ad)) === '1';
  } catch {
    return false;
  }
}

export function PopupAd() {
  const [ad, setAd] = useState<PopupAdType | null>(null);

  // Fetch the active popups once on mount and pick the first not-yet-dismissed.
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    api
      .getActivePopupAds()
      .then((ads) => {
        if (!active) return;
        const next = ads.find((a) => !wasDismissed(a));
        if (next) timer = setTimeout(() => active && setAd(next), 1000);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Lock background scroll while the popup is open.
  useEffect(() => {
    if (!ad) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [ad]);

  if (!ad) return null;

  function close() {
    try { localStorage.setItem(dismissKey(ad!), '1'); } catch { /* ignore */ }
    setAd(null);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-2xl leading-none text-white transition hover:bg-black/80"
        >
          ×
        </button>
        <a
          href={ad.linkUrl}
          target={ad.openInNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          onClick={close}
          className="block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl}
            alt={ad.title ?? 'Advertisement'}
            className="block h-auto max-h-[85vh] w-full object-contain"
          />
        </a>
      </div>
    </div>
  );
}
