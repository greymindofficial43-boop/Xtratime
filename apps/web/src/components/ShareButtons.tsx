'use client';

import { useEffect, useState } from 'react';

type Props = { url: string; title: string };

export function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  // Resolve the share target to an absolute URL. `url` comes in as a relative
  // path (e.g. /cricket/foo); prepend the current origin so shared/copied links
  // include the domain. Done after mount to keep SSR/hydration in sync, and it
  // automatically uses the right domain per edition.
  const [fullUrl, setFullUrl] = useState(url);
  useEffect(() => {
    if (/^https?:\/\//.test(url)) setFullUrl(url);
    else setFullUrl(`${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`);
  }, [url]);

  const enc = encodeURIComponent;

  const whatsapp = `https://wa.me/?text=${enc(`${title} ${fullUrl}`)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(fullUrl)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(fullUrl)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore (clipboard may be blocked)
    }
  }

  const base =
    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--sk-muted)]">Share</span>

      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${base} bg-[#25D366]`} aria-label="Share on WhatsApp">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 2a8 8 0 0 0-6.9 12L2 18l4.1-1.1A8 8 0 1 0 10 2Zm4.3 11c-.2.5-1 1-1.5 1-.4 0-.9.2-2.9-.6-2.4-1-3.9-3.5-4-3.7-.1-.2-1-1.3-1-2.4s.6-1.7.8-1.9c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.7 1.7c0 .2.1.4 0 .5l-.3.5-.3.3c-.1.1-.3.3-.1.5l.8 1.2c.5.6 1 .9 1.3 1l.5.2c.1 0 .3 0 .4-.1l.5-.6c.2-.3.4-.2.6-.1l1.6.8c.2.1.4.2.4.3.1.1.1.5-.1 1Z" />
        </svg>
        WhatsApp
      </a>

      <a href={facebook} target="_blank" rel="noopener noreferrer" className={`${base} bg-[#1877F2]`} aria-label="Share on Facebook">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M13.5 3H11a3.5 3.5 0 0 0-3.5 3.5V9H6v3h1.5v6h3v-6H13l.5-3h-3V6.5A.5.5 0 0 1 11 6h2.5V3Z" />
        </svg>
        Facebook
      </a>

      <a href={twitter} target="_blank" rel="noopener noreferrer" className={`${base} bg-black`} aria-label="Share on X">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M17.5 3h-2.6l-3 4-2.6-4H4l4.9 7-4.6 6.9h2.6l3.2-4.4 3 4.4h3.4l-5.1-7.3L17.5 3Z" />
        </svg>
        X
      </a>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sk-border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--sk-text)] transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
        aria-label="Copy link"
      >
        {copied ? '✓ Copied' : '🔗 Copy link'}
      </button>
    </div>
  );
}
