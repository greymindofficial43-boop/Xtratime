'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { EspnScheduleGame } from '@/lib/espn';
import { SCORECARD_TABS, type ScorecardTab } from '@/lib/scorecards';

type SportFilter = 'all' | Exclude<ScorecardTab, 'featured'>;
type StatusFilter = 'all' | 'live' | 'today' | 'upcoming' | 'completed';

function isToday(iso: string | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function TeamRow({ team, isCompleted }: { team: EspnScheduleGame['home']; isCompleted: boolean }) {
  const dimmed = isCompleted && !team.winner;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {team.logo ? (
          <div className="relative h-7 w-7 shrink-0">
            <Image src={team.logo} alt={team.abbr} fill className="object-contain" unoptimized />
          </div>
        ) : (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: team.color }}
          >
            {team.abbr.slice(0, 2)}
          </span>
        )}
        <div className="min-w-0">
          <p className={`truncate text-sm font-bold ${dimmed ? 'text-[var(--sk-muted)]' : 'text-[var(--sk-text)]'}`}>
            {team.name}
          </p>
        </div>
      </div>
      {team.score !== undefined && (
        <span className={`shrink-0 text-xl font-black tabular-nums ${dimmed ? 'text-[var(--sk-muted)]' : 'text-[var(--sk-text)]'} ${team.winner ? 'text-[var(--sk-accent)]' : ''}`}>
          {team.score}
        </span>
      )}
    </div>
  );
}

function GameCard({ game }: { game: EspnScheduleGame }) {
  const isLive = game.status === 'live';
  const isCompleted = game.status === 'completed';

  return (
    <a
      href={game.href}
      className="group block rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4 transition sk-card-lift hover:border-[var(--sk-accent)]/40"
    >
      {/* Card header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sk-cat-badge shrink-0 text-[9px]">{game.sport}</span>
          <span className="truncate text-[11px] text-[var(--sk-muted)]">{game.meta}</span>
        </div>
        {isLive ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[11px] font-black text-red-400">{game.liveMinute}</span>
          </div>
        ) : (
          <span className={`shrink-0 text-[11px] font-semibold ${isCompleted ? 'text-[var(--sk-muted)]' : 'text-[var(--sk-text)]'}`}>
            {game.statusDetail}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-2.5">
        <TeamRow team={game.home} isCompleted={isCompleted} />
        <TeamRow team={game.away} isCompleted={isCompleted} />
      </div>

      {game.venue && (
        <p className="mt-3 truncate text-[11px] text-[var(--sk-muted)]">📍 {game.venue}</p>
      )}
    </a>
  );
}

const SPORT_TABS: { id: SportFilter; label: string }[] = [
  { id: 'all', label: 'All Sports' },
  ...SCORECARD_TABS.filter((t) => t.id !== 'featured').map((t) => ({
    id: t.id as Exclude<ScorecardTab, 'featured'>,
    label: t.label,
  })),
];

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Final' },
];

export function EspnScheduleView({ games }: { games: EspnScheduleGame[] }) {
  const [activeSport, setActiveSport] = useState<SportFilter>('all');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');

  const liveCount = games.filter((g) => g.status === 'live').length;

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const sportOk = activeSport === 'all' || g.sportSlug === activeSport;
      let statusOk = true;
      if (activeStatus === 'live') statusOk = g.status === 'live';
      else if (activeStatus === 'today') statusOk = g.status !== 'live' && isToday(g.date);
      else if (activeStatus === 'upcoming') statusOk = g.status === 'upcoming';
      else if (activeStatus === 'completed') statusOk = g.status === 'completed';
      return sportOk && statusOk;
    });
  }, [games, activeSport, activeStatus]);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)]">
      {/* Sport pills */}
      <div className="border-b border-[var(--sk-border)] bg-[var(--sk-header-bg)] px-4 py-3">
        <div className="flex gap-2 overflow-x-auto sk-scrollbar-hide">
          {SPORT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSport(tab.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                activeSport === tab.id
                  ? 'bg-[var(--sk-accent)] text-white'
                  : 'text-[var(--sk-header-nav)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status tabs */}
      <div className="border-b border-[var(--sk-border)] px-4">
        <div className="flex gap-6 overflow-x-auto sk-scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-semibold transition ${
                activeStatus === tab.id
                  ? 'border-[var(--sk-accent)] text-[var(--sk-accent)]'
                  : 'border-transparent text-[var(--sk-muted)] hover:text-[var(--sk-text)]'
              }`}
            >
              {tab.label}
              {tab.id === 'live' && liveCount > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                  {liveCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game grid */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-[var(--sk-muted)]">No games match your filter.</p>
            <p className="mt-1 text-sm text-[var(--sk-muted)]">Try a different sport or time range.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--sk-border)] px-4 py-3">
        <p className="text-center text-[11px] text-[var(--sk-muted)]">
          Scores & schedules via ESPN · refreshes every 60 s
        </p>
      </div>
    </div>
  );
}
