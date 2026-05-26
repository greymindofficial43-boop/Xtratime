'use client';

import { useState } from 'react';
import type { Scorecard } from '@/lib/scorecards';

export function MatchDetailsClient({ match }: { match: Scorecard }) {
  // Logic-driven state: starting at 0, no mock pre-filled data.
  const [votedFor, setVotedFor] = useState<'home' | 'away' | null>(null);
  const [homeVotes, setHomeVotes] = useState(0);
  const [awayVotes, setAwayVotes] = useState(0);

  const handleVote = (team: 'home' | 'away') => {
    if (votedFor) return;
    setVotedFor(team);
    if (team === 'home') {
      setHomeVotes(prev => prev + 1);
    } else {
      setAwayVotes(prev => prev + 1);
    }
  };

  const totalVotes = homeVotes + awayVotes;
  const homePct = totalVotes > 0 ? Math.round((homeVotes / totalVotes) * 100) : 0;
  const awayPct = totalVotes > 0 ? Math.round((awayVotes / totalVotes) * 100) : 0;

  return (
    <div className="mt-6 space-y-6">
      {/* Polling Widget */}
      <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-6 shadow-sm">
        <h3 className="mb-4 text-center text-lg font-black uppercase tracking-wide text-[var(--sk-text)]">
          Who will win?
        </h3>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote('home')}
            disabled={votedFor !== null}
            className={`flex-1 rounded-lg px-4 py-3 font-bold transition ${
              votedFor === 'home'
                ? 'ring-2 ring-[var(--sk-accent)] bg-[var(--sk-bg)]'
                : 'bg-[var(--sk-bg)] hover:bg-[var(--sk-border)]'
            }`}
            style={{ color: match.home.color }}
          >
            {match.home.name}
          </button>
          <div className="text-sm font-bold text-[var(--sk-muted)]">VS</div>
          <button
            onClick={() => handleVote('away')}
            disabled={votedFor !== null}
            className={`flex-1 rounded-lg px-4 py-3 font-bold transition ${
              votedFor === 'away'
                ? 'ring-2 ring-[var(--sk-accent)] bg-[var(--sk-bg)]'
                : 'bg-[var(--sk-bg)] hover:bg-[var(--sk-border)]'
            }`}
            style={{ color: match.away.color }}
          >
            {match.away.name}
          </button>
        </div>

        {votedFor && (
          <div className="mt-6 space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="flex justify-between text-sm font-bold">
              <span style={{ color: match.home.color }}>{homePct}%</span>
              <span style={{ color: match.away.color }}>{awayPct}%</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--sk-border)]">
              <div
                className="transition-all duration-1000 ease-out"
                style={{ width: `${homePct}%`, backgroundColor: match.home.color }}
              />
              <div
                className="transition-all duration-1000 ease-out"
                style={{ width: `${awayPct}%`, backgroundColor: match.away.color }}
              />
            </div>
            <p className="text-center text-xs text-[var(--sk-muted)] mt-2">
              Thanks for voting!
            </p>
          </div>
        )}
      </div>

      {/* Scorecard Widget */}
      <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] shadow-sm">
        <div className="border-b border-[var(--sk-border)] px-6 py-4">
          <h3 className="font-bold uppercase tracking-wider text-[var(--sk-text)]">
            Scorecard
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--sk-border)] p-4">
              <h5 className="mb-2 font-bold" style={{ color: match.home.color }}>
                {match.home.name}
              </h5>
              <p className="text-3xl font-black text-[var(--sk-text)]">{match.home.score ?? '0'}</p>
              {match.home.overs && <p className="text-sm text-[var(--sk-muted)]">{match.home.overs}</p>}
            </div>
            <div className="rounded-lg border border-[var(--sk-border)] p-4">
              <h5 className="mb-2 font-bold" style={{ color: match.away.color }}>
                {match.away.name}
              </h5>
              <p className="text-3xl font-black text-[var(--sk-text)]">{match.away.score ?? '0'}</p>
              {match.away.overs && <p className="text-sm text-[var(--sk-muted)]">{match.away.overs}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
