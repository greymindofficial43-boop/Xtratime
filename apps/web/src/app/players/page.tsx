'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { PlayerSearchResult } from '@/lib/cricapi';

const FEATURED_PLAYERS = [
  { id: 'c61d247d-7f77-452c-b495-2813a9cd0ac4', name: 'Virat Kohli', country: 'India' },
  { id: '6da70c66-7cf5-4c8c-aba8-54b2a87f51d3', name: 'Rohit Sharma', country: 'India' },
  { id: '22e8f6f8-be4e-4c55-bc66-50b73aba4d7e', name: 'MS Dhoni', country: 'India' },
  { id: '612c0606-76dc-4f61-9416-41a7d0bee9f0', name: 'Babar Azam', country: 'Pakistan' },
  { id: '9f75a33f-a4c2-4d19-a88b-f43b56cc0cce', name: 'Steve Smith', country: 'Australia' },
  { id: '5d44e406-30b9-41bf-9b2f-22da8bdcf699', name: 'Ben Stokes', country: 'England' },
  { id: 'c2c57db1-a1e8-4c9c-9ff4-2d7380f1aa74', name: 'Kane Williamson', country: 'New Zealand' },
  { id: '9d30a2e5-f19e-4cd1-b5d4-ea4c0e0f6213', name: 'Joe Root', country: 'England' },
];

const FLAG_MAP: Record<string, string> = {
  India: '🇮🇳', Pakistan: '🇵🇰', Australia: '🇦🇺', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'New Zealand': '🇳🇿', 'South Africa': '🇿🇦', 'West Indies': '🏝️',
  'Sri Lanka': '🇱🇰', Bangladesh: '🇧🇩', Afghanistan: '🇦🇫',
  Zimbabwe: '🇿🇼', Ireland: '🇮🇪', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Netherlands: '🇳🇱',
};

function getFlag(country: string) {
  return FLAG_MAP[country] ?? '🏏';
}

export default function PlayersPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') search(query);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--sn-text)]">
          🏏 Cricket Player Stats
        </h1>
        <p className="mt-2 text-[var(--sn-muted)]">
          Search any cricketer to see their batting &amp; bowling statistics across Test, ODI, T20 and IPL formats.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8 flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sn-muted)]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="player-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search player name (e.g. Kohli, Bumrah, Stokes)..."
            className="w-full rounded-xl border border-[var(--sn-border)] bg-[var(--sn-surface)] pl-12 pr-4 py-3.5 text-[var(--sn-text)] placeholder-[var(--sn-muted)] outline-none focus:border-[var(--sn-accent)] transition text-sm"
          />
        </div>
        <button
          id="player-search-btn"
          onClick={() => search(query)}
          disabled={loading}
          className="rounded-xl px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
          style={{ background: 'var(--sn-accent)' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              Searching...
            </span>
          ) : 'Search'}
        </button>
      </div>

      {/* Search results */}
      {searched && (
        <div className="mb-10">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--sn-surface)]" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-[var(--sn-border)] bg-[var(--sn-surface)] p-8 text-center">
              <p className="text-[var(--sn-muted)]">No players found for &ldquo;{query}&rdquo;. Try a different name.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--sn-muted)]">
                {results.length} results for &ldquo;{query}&rdquo;
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    className="group flex flex-col gap-1 rounded-xl border border-[var(--sn-border)] bg-[var(--sn-surface)] p-4 transition hover:border-[var(--sn-accent)] hover:shadow-lg"
                  >
                    <span className="text-2xl">{getFlag(p.country)}</span>
                    <span className="font-bold text-[var(--sn-text)] group-hover:text-[var(--sn-accent)] transition text-sm leading-tight">{p.name}</span>
                    <span className="text-xs text-[var(--sn-muted)]">{p.country}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Featured players */}
      {!searched && (
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--sn-muted)]">
            Featured Players
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FEATURED_PLAYERS.map((p) => (
              <Link
                key={p.id}
                href={`/players/${p.id}`}
                className="group flex flex-col gap-1.5 rounded-xl border border-[var(--sn-border)] bg-[var(--sn-surface)] p-4 transition hover:border-[var(--sn-accent)] hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{getFlag(p.country)}</span>
                  <svg className="text-[var(--sn-muted)] opacity-0 group-hover:opacity-100 transition" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
                <span className="font-bold text-[var(--sn-text)] group-hover:text-[var(--sn-accent)] transition text-sm leading-tight">{p.name}</span>
                <span className="text-xs text-[var(--sn-muted)]">{p.country}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
