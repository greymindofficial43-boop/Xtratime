'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { PlayerSearchResult } from '@/lib/cricapi';



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

  // Restore last search from sessionStorage on mount
  useEffect(() => {
    const savedQuery = sessionStorage.getItem('playerSearchQuery');
    const savedResults = sessionStorage.getItem('playerSearchResults');
    if (savedQuery && savedResults) {
      try {
        setQuery(savedQuery);
        setResults(JSON.parse(savedResults));
        setSearched(true);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); sessionStorage.removeItem('playerSearchQuery'); sessionStorage.removeItem('playerSearchResults'); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        // Persist search for back navigation
        sessionStorage.setItem('playerSearchQuery', q);
        sessionStorage.setItem('playerSearchResults', JSON.stringify(data));
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

      {/* Empty state before search */}
      {!searched && (
        <div className="rounded-xl border border-dashed border-[var(--sn-border)] p-12 text-center text-[var(--sn-muted)]">
          Type a player's name above (e.g. Kohli, Stokes, Starc) to fetch live statistics from CricAPI.
        </div>
      )}
    </div>
  );
}
