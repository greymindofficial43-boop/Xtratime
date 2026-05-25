'use client';

import { useEffect, useRef, useState } from 'react';
import { api, type Advertisement } from '@/lib/api';

type Props = {
  slotId: string;
  className?: string;
};

export function AdSlot({ slotId, className = '' }: Props) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const googleContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadAd() {
      try {
        const ads = await api.getAds(slotId);
        setAd(ads[0] ?? null);
      } catch {
        setAd(null);
      }
    }

    loadAd();
  }, [slotId]);

  useEffect(() => {
    if (ad?.type !== 'GOOGLE' || !ad.googleCode || !googleContainerRef.current) return;

    const container = googleContainerRef.current;
    container.innerHTML = ad.googleCode;

    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((script) => {
      const nextScript = document.createElement('script');

      Array.from(script.attributes).forEach((attribute) => {
        nextScript.setAttribute(attribute.name, attribute.value);
      });

      nextScript.text = script.text;
      script.parentNode?.replaceChild(nextScript, script);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [ad]);

  if (!ad) return null;

  return (
    <div
      className={`w-full rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4 text-center ${className}`}
    >
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--sk-muted)]">
        Advertisement
      </span>

      {ad.type === 'CUSTOM' ? (
        <a
          href={ad.targetUrl ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-md border border-[var(--sk-border)] bg-[var(--sk-bg)]"
        >
          {ad.imageUrl ? (
            <img src={ad.imageUrl} alt={ad.title} className="h-auto w-full object-cover" />
          ) : (
            <div className="flex min-h-[120px] items-center justify-center px-4 text-sm text-[var(--sk-muted)]">
              {ad.partnerName ?? ad.title}
            </div>
          )}
        </a>
      ) : (
        <div
          ref={googleContainerRef}
          className="overflow-hidden rounded-md border border-[var(--sk-border)] bg-[var(--sk-bg)] p-3 text-left"
        />
      )}
    </div>
  );
}
