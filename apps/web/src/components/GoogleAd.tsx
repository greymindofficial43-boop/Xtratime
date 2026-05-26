'use client';

import { useEffect } from 'react';

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Replace these with your actual AdSense slot IDs.
 * Get them from: Google AdSense → Ads → By ad unit → Create ad unit
 */
export const AD_SLOTS = {
  leaderboard: 'XXXXXXXXXX',
  inContentTop: 'XXXXXXXXXX',
  inContentMid: 'XXXXXXXXXX',
  inArticleTop: 'XXXXXXXXXX',
  inArticleBottom: 'XXXXXXXXXX',
  sidebar: 'XXXXXXXXXX',
  footerBanner: 'XXXXXXXXXX',
} as const;

type Props = {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  minHeight?: number;
  label?: string;
};

export function GoogleAd({
  slot,
  format = 'auto',
  className = '',
  minHeight = 90,
  label = 'Advertisement',
}: Props) {
  useEffect(() => {
    if (!CLIENT) return;
    try {
      type W = typeof window & { adsbygoogle?: unknown[] };
      ((window as W).adsbygoogle = (window as W).adsbygoogle ?? []).push({});
    } catch {}
  }, []);

  return (
    <div className={`sk-ad-unit ${className}`}>
      <span className="sk-ad-label">{label}</span>
      {CLIENT ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="sk-ad-placeholder" style={{ minHeight }}>
          <span className="text-xs font-medium text-[var(--sk-muted)]">
            Google Ad Space — set{' '}
            <code className="rounded bg-[var(--sk-surface-elevated)] px-1 py-0.5 text-[11px]">
              NEXT_PUBLIC_ADSENSE_CLIENT
            </code>{' '}
            to activate
          </span>
        </div>
      )}
    </div>
  );
}
