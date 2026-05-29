import { fetchAllScoreboards } from '@/lib/espn';
import { fetchCricketScorecards } from '@/lib/cricapi';
import { LiveScoresTabs } from './LiveScoresTabs';
import { api } from '@/lib/api';
import type { Scorecard, ScorecardTab } from '@/lib/scorecards';

export async function LiveScoresSection() {
  const [espn, cricket, adminMatchesRaw] = await Promise.all([
    fetchAllScoreboards(),
    fetchCricketScorecards(10),
    api.getMatches().catch(() => []),
  ]);

  const adminMatches: Scorecard[] = adminMatchesRaw.map((m) => {
    const sportSlug = m.sport.toLowerCase().trim() as ScorecardTab;
    const d = new Date(m.date);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    const abbr = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
    return {
      id: `admin-${m.id}`,
      tabs: ['featured', sportSlug],
      meta: m.title,
      home: {
        abbr: abbr(m.homeTeamName),
        name: m.homeTeamName,
        logo: m.homeTeamLogo || undefined,
        score: m.homeTeamScore || undefined,
        color: 'var(--sk-accent)',
      },
      away: {
        abbr: abbr(m.awayTeamName),
        name: m.awayTeamName,
        logo: m.awayTeamLogo || undefined,
        score: m.awayTeamScore || undefined,
        color: 'var(--sk-text)',
      },
      status: (m.status === 'result' ? 'completed' : m.status) as Scorecard['status'],
      result: m.note || undefined,
      scheduledTime: hasTime
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      scheduledDay: hasTime
        ? d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
        : undefined,
      href: '#',
    };
  });

  const liveFirst = [
    ...adminMatches.filter((c) => c.status === 'live'),
    ...cricket.filter((c) => c.status === 'live'),
    ...espn.featured.filter((c) => c.status === 'live'),
    ...adminMatches.filter((c) => c.status === 'upcoming'),
    ...cricket.filter((c) => c.status === 'upcoming'),
    ...espn.featured.filter((c) => c.status === 'upcoming'),
    ...adminMatches.filter((c) => c.status === 'completed'),
    ...espn.featured.filter((c) => c.status === 'completed'),
  ].slice(0, 15);

  const cards = { ...espn, cricket, featured: liveFirst };

  // Inject admin matches into their respective sport tabs
  adminMatches.forEach((m) => {
    const sport = m.tabs[1] as string;
    if (!cards[sport as keyof typeof cards]) {
      // It's a new sport tab, we only add it if it's already an existing array in espn, or we just rely on featured
    } else {
      (cards[sport as keyof typeof cards] as Scorecard[]).unshift(m);
    }
  });

  return (
    <section className="border-b border-[var(--sk-border)] bg-[var(--sk-bg)]">
      <LiveScoresTabs cards={cards} />
    </section>
  );
}
