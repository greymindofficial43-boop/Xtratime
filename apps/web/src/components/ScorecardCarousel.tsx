import Link from 'next/link';
import type { Scorecard } from '@/lib/scorecards';

function TeamRow({ team }: { team: Scorecard['home'] }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {team.abbr.slice(0, 2)}
        </span>
        <span className="truncate text-sm font-semibold text-[var(--sk-text)]">{team.abbr}</span>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-sm font-bold text-[var(--sk-text)]">{team.score ?? '0'}</span>
        {team.overs && (
          <span className="ml-1 text-xs text-[var(--sk-muted)]">{team.overs}</span>
        )}
      </div>
    </div>
  );
}

function ScorecardCard({ card }: { card: Scorecard }) {
  return (
    <div className="flex flex-col min-w-[220px] shrink-0 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] transition hover:border-[var(--sk-accent)]/50">
      <Link href={card.href} className="flex-1 block">
        <div className="border-b border-[var(--sk-border)] px-3 py-2">
          <p className="text-[11px] font-medium text-[var(--sk-muted)]">{card.meta}</p>
        </div>

        <div className="px-3 py-2">
          <TeamRow team={card.home} />
          <TeamRow team={card.away} />
        </div>

        <div className="min-h-[40px] border-t border-[var(--sk-border)] px-3 py-2">
          {card.status === 'completed' && card.result && (
            <p className="text-xs font-semibold text-sky-400">{card.result}</p>
          )}
          {card.status === 'live' && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold text-red-400">LIVE</span>
              {card.liveMinute && (
                <span className="text-xs text-[var(--sk-muted)]">{card.liveMinute}</span>
              )}
              {card.result && (
                <span className="ml-auto text-xs text-sky-400">{card.result}</span>
              )}
            </div>
          )}
          {card.status === 'upcoming' && (
            <div>
              <p className="text-sm font-bold text-[var(--sk-text)]">{card.scheduledTime}</p>
              <p className="text-xs text-[var(--sk-muted)]">{card.scheduledDay}</p>
            </div>
          )}
        </div>
      </Link>

      {card.showPointsTable && (
        <div className="flex border-t border-[var(--sk-border)] text-[11px]">
          <Link href="/standings" className="flex-1 border-r border-[var(--sk-border)] px-2 py-1.5 text-center text-[var(--sk-muted)] hover:text-[var(--sk-text)] transition block">
            Points Table ›
          </Link>
          <Link href="/schedule" className="flex-1 px-2 py-1.5 text-center text-[var(--sk-muted)] hover:text-[var(--sk-text)] transition block">
            Schedule ›
          </Link>
        </div>
      )}
    </div>
  );
}

export function ScorecardCarousel({ cards }: { cards: Scorecard[] }) {
  if (cards.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--sk-muted)]">No fixtures for this tab.</p>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sk-scrollbar-hide">
      {cards.map((card) => (
        <ScorecardCard key={card.id} card={card} />
      ))}
    </div>
  );
}
