import { fetchAllScoreboards } from '@/lib/espn';
import { fetchCricketScorecards } from '@/lib/cricapi';
import { LiveScoresTabs } from './LiveScoresTabs';
import { api } from '@/lib/api';
import type { Scorecard, ScorecardTab } from '@/lib/scorecards';
import { storedMatchToScorecard } from '@/lib/storedMatches';

export async function LiveScoresSection() {
  const [espn, cricket, adminMatchesRaw] = await Promise.all([
    fetchAllScoreboards(),
    fetchCricketScorecards(10),
    api.getMatches().catch(() => []),
  ]);

  const adminMatches: Scorecard[] = adminMatchesRaw.map((match) => storedMatchToScorecard(match));

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
    const sport = (m.tabs[1] ?? 'featured') as string;
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
