import { notFound } from 'next/navigation';
import { fetchAllScoreboards } from '@/lib/espn';
import { fetchCricketScorecards } from '@/lib/cricapi';
import { MatchDetailsClient } from '@/components/MatchDetailsClient';
import type { Scorecard } from '@/lib/scorecards';
import { api } from '@/lib/api';
import { storedMatchToScorecard } from '@/lib/storedMatches';

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [espn, cricket, adminMatchesRaw] = await Promise.all([
    fetchAllScoreboards(),
    fetchCricketScorecards(20),
    api.getMatches().catch(() => []),
  ]);

  const adminMatches: Scorecard[] = adminMatchesRaw.map((match) => storedMatchToScorecard(match));
  const storedMatch = id.startsWith('admin-')
    ? adminMatchesRaw.find((match) => `admin-${match.id}` === id)
    : null;

  const allMatches: Scorecard[] = [
    ...adminMatches,
    ...cricket,
    ...espn.nfl,
    ...espn.nba,
    ...espn.mlb,
    ...espn.soccer,
    ...espn.nhl,
  ];

  const match = allMatches.find((m) => m.id === id);

  if (!match) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-6 shadow-sm">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-[var(--sk-bg)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--sk-muted)]">
            {match.meta}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-1 flex-col items-center gap-3 text-center">
            {match.home.logo && (match.home.logo.startsWith('http') || match.home.logo.startsWith('/')) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.home.logo} alt={match.home.name} className="h-20 w-20 rounded-full object-contain bg-[var(--sk-surface)] shadow-lg" />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg"
                style={{ backgroundColor: match.home.color }}
              >
                {match.home.abbr.replace(/^https?:\/\/.*/, '').slice(0, 3).toUpperCase() || '?'}
              </div>
            )}
            <h2 className="text-xl font-bold text-[var(--sk-text)]">{match.home.name}</h2>
          </div>
          
          <div className="flex flex-col items-center justify-center px-4">
            {match.status === 'live' && (
              <span className="mb-2 animate-pulse rounded bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-500">
                LIVE {match.liveMinute && `• ${match.liveMinute}`}
              </span>
            )}
            {match.status === 'upcoming' && (
              <span className="mb-2 rounded bg-[var(--sk-border)] px-2 py-0.5 text-xs font-bold text-[var(--sk-muted)]">
                UPCOMING
              </span>
            )}
            {match.status === 'completed' && (
              <span className="mb-2 rounded bg-[var(--sk-border)] px-2 py-0.5 text-xs font-bold text-[var(--sk-muted)]">
                FINAL
              </span>
            )}
            
            <div className="text-4xl font-black tabular-nums text-[var(--sk-text)]">
              {`${match.home.score ?? '0'} - ${match.away.score ?? '0'}`}
            </div>
            
            {match.status === 'upcoming' && match.scheduledTime && (
              <div className="mt-2 text-center text-sm font-semibold text-[var(--sk-muted)]">
                {match.scheduledDay}<br />{match.scheduledTime}
              </div>
            )}
            {match.result && (
              <div className="mt-2 text-center text-sm font-semibold text-sky-500">
                {match.result}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 text-center">
            {match.away.logo && (match.away.logo.startsWith('http') || match.away.logo.startsWith('/')) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.away.logo} alt={match.away.name} className="h-20 w-20 rounded-full object-contain bg-[var(--sk-surface)] shadow-lg" />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg"
                style={{ backgroundColor: match.away.color }}
              >
                {match.away.abbr.replace(/^https?:\/\/.*/, '').slice(0, 3).toUpperCase() || '?'}
              </div>
            )}
            <h2 className="text-xl font-bold text-[var(--sk-text)]">{match.away.name}</h2>
          </div>
        </div>
      </div>

      {storedMatch && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sk-muted)]">Competition</p>
            <p className="mt-2 text-sm font-semibold text-[var(--sk-text)]">{storedMatch.league || storedMatch.sport}</p>
          </div>
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sk-muted)]">Date & Time</p>
            <p className="mt-2 text-sm font-semibold text-[var(--sk-text)]">{new Date(storedMatch.date).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sk-muted)]">Venue</p>
            <p className="mt-2 text-sm font-semibold text-[var(--sk-text)]">{storedMatch.venue || 'Venue not provided'}</p>
          </div>
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4 md:col-span-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sk-muted)]">Match Update</p>
            <p className="mt-2 text-sm leading-6 text-[var(--sk-text)]">
              {storedMatch.statusDetail || storedMatch.note || 'Detailed update not available yet.'}
            </p>
          </div>
        </div>
      )}

      <MatchDetailsClient match={match} details={storedMatch?.details} />
    </div>
  );
}
