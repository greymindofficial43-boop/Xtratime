import { AdSlot } from '@/components/AdSlot';
import { EspnScheduleView } from '@/components/EspnScheduleView';
import { fetchAllScheduleGames, type EspnScheduleGame } from '@/lib/espn';
import { fetchCricketScorecards } from '@/lib/cricapi';
import { api } from '@/lib/api';
import { storedMatchToScorecard } from '@/lib/storedMatches';

export const metadata = {
  title: 'Sports Schedule & Live Scores',
  description: 'Live scores, today\'s fixtures and results across Cricket, NFL, NBA, MLB, Soccer and NHL.',
};

export default async function SchedulePage() {
  const [espnGames, cricketCards, adminMatchesRaw] = await Promise.all([
    fetchAllScheduleGames(),
    fetchCricketScorecards(20),
    api.getMatches().catch(() => []),
  ]);

  const cricketGames: EspnScheduleGame[] = cricketCards.map((c) => ({
    id: c.id,
    sport: 'Cricket',
    sportSlug: 'cricket',
    meta: c.meta,
    home: {
      abbr: c.home.abbr,
      name: c.home.name,
      fullName: c.home.name,
      logo: '',
      color: c.home.color,
      score: c.home.score,
    },
    away: {
      abbr: c.away.abbr,
      name: c.away.name,
      fullName: c.away.name,
      logo: '',
      color: c.away.color,
      score: c.away.score,
    },
    status: c.status,
    statusDetail: c.status === 'live' ? (c.liveMinute ?? 'Live') : (c.result ?? ''),
    liveMinute: c.liveMinute,
    href: c.href,
  }));

  const adminGames: EspnScheduleGame[] = adminMatchesRaw.map((match) => {
    const card = storedMatchToScorecard(match);
    return {
      id: card.id,
      sport: match.sport,
      sportSlug: (card.tabs[1] ?? 'cricket') as EspnScheduleGame['sportSlug'],
      meta: card.meta,
      home: {
        abbr: card.home.abbr,
        name: card.home.name,
        fullName: card.home.name,
        logo: card.home.logo,
        color: card.home.color,
        score: card.home.score,
      },
      away: {
        abbr: card.away.abbr,
        name: card.away.name,
        fullName: card.away.name,
        logo: card.away.logo,
        color: card.away.color,
        score: card.away.score,
      },
      status: card.status,
      statusDetail: match.statusDetail || match.note || (card.status === 'upcoming'
        ? `${card.scheduledDay ?? 'Today'} · ${card.scheduledTime ?? ''}`.trim()
        : card.status === 'live'
          ? 'Live'
          : 'Final'),
      date: match.date,
      venue: match.venue ?? undefined,
      href: card.href,
    };
  });

  const games = [...adminGames, ...cricketGames, ...espnGames];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
      <div>
        <div className="mb-6">
          <h1 className="sk-section-heading text-2xl font-black text-[var(--sk-text)]">
            Schedule &amp; Live Scores
          </h1>
          <p className="mt-1 text-sm text-[var(--sk-muted)]">
            Cricket · NFL · NBA · MLB · Soccer · NHL
          </p>
        </div>
        <EspnScheduleView games={games} />
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <AdSlot zone="sidebar" />
          </div>
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <AdSlot zone="sidebar" />
          </div>
        </div>
      </aside>
    </div>
  );
}
