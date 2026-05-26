import type { CricketMatch } from '@/lib/cricapi';

const ABBR_MAP: Record<string, string> = {
  India: 'IND', Australia: 'AUS', England: 'ENG', Pakistan: 'PAK',
  'South Africa': 'SA', 'New Zealand': 'NZ', 'West Indies': 'WI',
  'Sri Lanka': 'SL', Bangladesh: 'BAN', Afghanistan: 'AFG',
  Zimbabwe: 'ZIM', Ireland: 'IRE',
};

const FLAG_MAP: Record<string, string> = {
  India: '🇮🇳', Australia: '🇦🇺', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Pakistan: '🇵🇰',
  'South Africa': '🇿🇦', 'New Zealand': '🇳🇿', 'West Indies': '🏝️',
  'Sri Lanka': '🇱🇰', Bangladesh: '🇧🇩', Afghanistan: '🇦🇫',
  Zimbabwe: '🇿🇼', Ireland: '🇮🇪', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Netherlands: '🇳🇱',
};

function abbr(name: string) {
  return ABBR_MAP[name] ?? name.slice(0, 3).toUpperCase();
}

function flag(name: string) {
  return FLAG_MAP[name] ?? '🏏';
}

export function CricketMatchCard({ match }: { match: CricketMatch }) {
  const [t1, t2] = match.teams;
  const s1 = match.scores.find((s) => s.team === t1);
  const s2 = match.scores.find((s) => s.team === t2);

  return (
    <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--sk-border)] bg-[var(--sk-surface-elevated)] px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--sk-muted)]">
          {match.matchType}
        </span>
        {match.status === 'live' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            LIVE
          </span>
        )}
        {match.status === 'completed' && (
          <span className="text-[11px] font-semibold text-sky-400">Final</span>
        )}
        {match.status === 'upcoming' && (
          <span className="text-[11px] font-semibold text-emerald-400">Upcoming</span>
        )}
      </div>

      {/* Teams + scores */}
      <div className="divide-y divide-[var(--sk-border)] px-4">
        {[
          { name: t1, score: s1 },
          { name: t2, score: s2 },
        ].map(({ name, score }) => (
          <div key={name} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{flag(name)}</span>
              <div>
                <p className="text-sm font-bold text-[var(--sk-text)]">
                  {abbr(name)}
                </p>
                <p className="text-[11px] text-[var(--sk-muted)]">{name}</p>
              </div>
            </div>
            {score ? (
              <div className="text-right">
                <p className="text-base font-black text-[var(--sk-text)]">
                  {score.runs}/{score.wickets}
                </p>
                <p className="text-[11px] text-[var(--sk-muted)]">({score.overs} ovs)</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--sk-muted)]">—</p>
            )}
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="border-t border-[var(--sk-border)] bg-[var(--sk-surface-elevated)] px-4 py-2">
        <p className="text-xs text-[var(--sk-muted)] leading-snug">{match.statusText}</p>
        {match.venue && (
          <p className="mt-0.5 text-[11px] text-[var(--sk-muted)] opacity-70 truncate">
            📍 {match.venue}
          </p>
        )}
      </div>
    </div>
  );
}
