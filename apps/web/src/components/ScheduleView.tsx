'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, type Match, type MatchStatus } from '@/lib/api';

const TABS = ['Live', 'Upcoming', 'Result'] as const;

function formatMatchDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ScheduleView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<MatchStatus>('live');
  const [activeSport, setActiveSport] = useState('All');
  const [viewMode, setViewMode] = useState<'days' | 'series'>('days');

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getMatches();
        setMatches(data);
      } catch {
        setError('Unable to load the schedule right now.');
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const sports = useMemo(
    () => ['All', ...Array.from(new Set(matches.map((match) => match.sport))).sort()],
    [matches],
  );

  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const matchesTab = match.status === activeTab;
        const matchesSport = activeSport === 'All' || match.sport === activeSport;
        return matchesTab && matchesSport;
      }),
    [activeSport, activeTab, matches],
  );

  return (
    <div className="bg-[var(--sk-surface)] border border-[var(--sk-border)] rounded-lg overflow-hidden">
      {/* Sport Filter Header */}
      <div className="flex gap-4 p-4 border-b border-[var(--sk-border)] bg-[var(--sk-header-bg)]">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              activeSport === sport
                ? 'bg-[var(--sk-accent)] text-white'
                : 'bg-[var(--sk-bg)] text-[var(--sk-muted)] hover:text-white'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* View Mode Toggle (Days / Series) */}
      <div className="flex justify-center py-3 border-b border-[var(--sk-border)] bg-[var(--sk-surface)]">
        <div className="flex bg-[var(--sk-bg)] rounded-full p-1 border border-[var(--sk-border)]">
          <button
            onClick={() => setViewMode('days')}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition ${
              viewMode === 'days' ? 'bg-[var(--sk-accent)] text-white' : 'text-[var(--sk-muted)] hover:text-white'
            }`}
          >
            Days
          </button>
          <button
            onClick={() => setViewMode('series')}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition ${
              viewMode === 'series' ? 'bg-[var(--sk-accent)] text-white' : 'text-[var(--sk-muted)] hover:text-white'
            }`}
          >
            Series
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-[var(--sk-border)]">
        {TABS.map((tab) => {
          const id = tab.toLowerCase() as typeof activeTab;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-[3px] transition ${
                activeTab === id
                  ? 'border-[var(--sk-accent)] text-[var(--sk-accent)]'
                  : 'border-transparent text-[var(--sk-muted)] hover:text-[var(--sk-text)] hover:bg-[var(--sk-hover)]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Matches List */}
      <div className="p-3 bg-[var(--sk-bg)] min-h-[400px]">
        {loading ? (
          <p className="text-center text-[var(--sk-muted)] py-10 text-sm">Loading schedule...</p>
        ) : error ? (
          <p className="text-center text-red-400 py-10 text-sm">{error}</p>
        ) : filteredMatches.length === 0 ? (
          <p className="text-center text-[var(--sk-muted)] py-10 text-sm">No matches found for this selection.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-[var(--sk-surface)] border border-[var(--sk-border)] rounded-md p-3 shadow-sm hover:border-[var(--sk-accent)]/50 transition">
                <div className="flex items-center gap-2 mb-2">
                  {match.status === 'live' && (
                    <span className="bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
                  )}
                  <h3 className="text-[11px] font-medium text-[var(--sk-muted)] truncate">{match.title}</h3>
                </div>
                
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{match.homeTeamLogo}</span>
                      <span className="text-sm font-semibold text-[var(--sk-text)]">{match.homeTeamName}</span>
                    </div>
                    {match.homeTeamScore && <span className="text-sm font-semibold text-[var(--sk-text)]">{match.homeTeamScore}</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{match.awayTeamLogo}</span>
                      <span className="text-sm font-semibold text-[var(--sk-text)]">{match.awayTeamName}</span>
                    </div>
                    {match.awayTeamScore && <span className="text-sm font-semibold text-[var(--sk-text)]">{match.awayTeamScore}</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--sk-border)] space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--sk-muted)]">
                    {formatMatchDate(match.date)}
                  </p>
                  {match.note && (
                    <p className="text-[10px] text-[var(--sk-muted)]">{match.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
