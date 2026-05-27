'use client';

import { useEffect, useRef, useState } from 'react';
import { api, type Advertisement } from '@/lib/api';

const ROTATE_INTERVAL_MS = 5000; // switch ad every 5 seconds

type Props = {
  zone: 'inline' | 'sidebar';
  className?: string;
};

export function AdSlot({ zone, className = '' }: Props) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const googleContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track which ad IDs we've already counted a view for in this session
  const viewedIds = useRef<Set<string>>(new Set());

  // Fetch all active ads for this zone once
  useEffect(() => {
    async function loadAds() {
      try {
        const data = await api.getAds(zone);
        if (data.length > 0) {
          const startIndex = Math.floor(Math.random() * data.length);
          setIndex(startIndex);
          setAds(data);
          // Record a view for the initially-shown ad
          if (data[startIndex] && !viewedIds.current.has(data[startIndex].id)) {
            viewedIds.current.add(data[startIndex].id);
            api.recordAdView(data[startIndex].id);
          }
        }
      } catch {
        setAds([]);
      }
    }
    loadAds();
  }, [zone]);

  // Rotate through ads with a quick fade-out / fade-in
  useEffect(() => {
    if (ads.length <= 1) return;

    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => {
          const next = (prev + 1) % ads.length;
          // Record a view for the newly shown ad (only once per session)
          const nextAd = ads[next];
          if (nextAd && !viewedIds.current.has(nextAd.id)) {
            viewedIds.current.add(nextAd.id);
            api.recordAdView(nextAd.id);
          }
          return next;
        });
        setVisible(true);
      }, 300);
    }, ROTATE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ads]);

  const ad = ads[index] ?? null;

  // Inject Google Ad scripts when current ad is GOOGLE type
  useEffect(() => {
    if (ad?.type !== 'GOOGLE' || !ad.googleCode || !googleContainerRef.current) return;
    const container = googleContainerRef.current;
    container.innerHTML = ad.googleCode;
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((script) => {
      const next = document.createElement('script');
      Array.from(script.attributes).forEach((a) => next.setAttribute(a.name, a.value));
      next.text = script.text;
      script.parentNode?.replaceChild(next, script);
    });
    return () => { container.innerHTML = ''; };
  }, [ad]);

  function handleClick() {
    if (ad) {
      api.recordAdClick(ad.id);
    }
  }

  if (!ad) return null;

  return (
    <div
      className={`w-full rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] p-2 text-center ${className}`}
      style={{ transition: 'opacity 0.3s ease', opacity: visible ? 1 : 0 }}
    >
      <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[var(--sk-muted)]">
        Advertisement
      </span>

      {ad.type === 'CUSTOM' ? (
        <a
          href={ad.targetUrl ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center overflow-hidden rounded-md"
          onClick={handleClick}
        >
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="mx-auto max-h-[250px] w-auto object-contain"
              style={{ display: 'block' }}
            />
          ) : (
            <div className="flex min-h-[80px] items-center justify-center px-4 text-sm font-semibold text-[var(--sk-text)]">
              {ad.partnerName ?? ad.title}
            </div>
          )}
        </a>
      ) : (
        <div
          ref={googleContainerRef}
          className="overflow-hidden rounded-md text-left"
        />
      )}

      {/* Dot indicators when multiple ads */}
      {ads.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-1">
          {ads.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true); }, 300); }}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-[var(--sk-accent)]' : 'w-1.5 bg-[var(--sk-border)]'}`}
              aria-label={`Ad ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
