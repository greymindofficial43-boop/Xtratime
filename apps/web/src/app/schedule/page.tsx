import { AdSlot } from '@/components/AdSlot';
import { EspnScheduleView } from '@/components/EspnScheduleView';
import { fetchAllScheduleGames, type EspnScheduleGame } from '@/lib/espn';
import { fetchCricketScorecards } from '@/lib/cricapi';
import { api } from '@/lib/api';
import type { ScorecardTab } from '@/lib/scorecards';

export const metadata = {
  title: 'Sports Schedule & Live Scores | SportyNewz',
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

  const adminGames: EspnScheduleGame[] = adminMatchesRaw.map((m) => {
    const d = new Date(m.date);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    const scheduledTime = hasTime
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const scheduledDay = hasTime
      ? d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      : 'Today';

    const sportSlug = m.sport.toLowerCase().trim() as Exclude<ScorecardTab, 'featured'>;
    const status = m.status === 'result' ? 'completed' : m.status;

    return {
      id: `admin-${m.id}`,
      sport: m.sport,
      sportSlug,
      meta: m.title,
      home: {
        abbr: m.homeTeamName.substring(0, 3).toUpperCase(),
        name: m.homeTeamName,
        fullName: m.homeTeamName,
        logo: m.homeTeamLogo || '',
        color: 'var(--sk-text)',
        score: m.homeTeamScore || undefined,
      },
      away: {
        abbr: m.awayTeamName.substring(0, 3).toUpperCase(),
        name: m.awayTeamName,
        fullName: m.awayTeamName,
        logo: m.awayTeamLogo || '',
        color: 'var(--sk-text)',
        score: m.awayTeamScore || undefined,
      },
      status: status as EspnScheduleGame['status'],
      statusDetail: status === 'live' ? 'Live' : status === 'completed' ? (m.note || 'Final') : `${scheduledDay} · ${scheduledTime}`,
      date: m.date,
      href: '#',
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
