'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { Category } from '@/lib/api';

type Props = {
  categories: Category[];
};

const QUICK_LINKS = [
  { label: '🔴 Live Scores', href: '/schedule' },
  { label: '📊 Standings', href: '/standings' },
  { label: '🔍 Search', href: '/search?q=' },
  { label: '👤 Players', href: '/players' },
];

const SPORT_ICONS: Record<string, string> = {
  cricket: '🏏', football: '⚽', nba: '🏀', nfl: '🏈',
  wwe: '🤼', f1: '🏎️', tennis: '🎾', mma: '🥊',
  nhl: '🏒', mlb: '⚾', gaming: '🎮', golf: '⛳',
  'indian-sports': '🇮🇳', soccer: '⚽',
};

export function AllSportsPanel({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="All Sports"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2c35] text-[#9ca3af] transition hover:border-[var(--sn-accent)] hover:text-white"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel — slides in from right */}
          <aside
            className="absolute right-0 top-0 flex h-full flex-col bg-[#0d0f14] shadow-2xl"
            style={{ width: 'min(420px, 100vw)', animation: 'slideInRight 0.22s ease-out' }}
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#1e2028] px-4">
              <span className="text-sm font-black uppercase tracking-widest text-white">All Sports</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-[#666] transition hover:bg-[#1e2028] hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-2 p-4">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-[#1e2028] bg-[#13151c] px-3 py-3 text-sm font-semibold text-[#c8ccd6] transition hover:border-[var(--sn-accent)] hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-[#1e2028]" />
              <p className="px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#555]">
                All Categories
              </p>

              {/* Category grid */}
              <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                {topLevel.map((cat) => {
                  const href = `/category/${cat.slug}`;
                  const active = pathname.startsWith(href);
                  const icon = cat.icon || SPORT_ICONS[cat.slug] || '🏆';
                  const children = categories.filter((c) => c.parentId === cat.id);
                  return (
                    <div
                      key={cat.id}
                      className={`rounded-xl border transition ${active ? 'border-[var(--sn-accent)] bg-[#1a0e0a]' : 'border-[#1e2028] bg-[#13151c] hover:border-[#2a2c35]'}`}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-3"
                      >
                        <span className="text-xl">{icon}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold leading-tight ${active ? 'text-[var(--sn-accent)]' : 'text-white'}`}>
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="mt-0.5 truncate text-[10px] text-[#666]">{cat.description}</p>
                          )}
                        </div>
                      </Link>
                      {children.length > 0 && (
                        <div className="border-t border-[#1e2028] px-3 py-2 flex flex-wrap gap-1.5">
                          {children.slice(0, 4).map((child) => (
                            <Link
                              key={child.id}
                              href={`/category/${child.slug}`}
                              onClick={() => setOpen(false)}
                              className="rounded-full bg-[#1e2028] px-2.5 py-1 text-[10px] font-semibold text-[#9ca3af] transition hover:bg-[var(--sn-accent)] hover:text-white"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-[#1e2028] px-4 py-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="sn-logo text-lg"
              >
                Xtra<span className="sn-logo-accent"> Time</span>
              </Link>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
