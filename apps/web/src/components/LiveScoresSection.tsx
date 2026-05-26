import { fetchAllScoreboards } from '@/lib/espn';
import { fetchCricketScorecards } from '@/lib/cricapi';
import { LiveScoresTabs } from './LiveScoresTabs';

export async function LiveScoresSection() {
  const [espn, cricket] = await Promise.all([
    fetchAllScoreboards(),
    fetchCricketScorecards(10),
  ]);

  const liveFirst = [
    ...cricket.filter((c) => c.status === 'live'),
    ...espn.featured.filter((c) => c.status === 'live'),
    ...cricket.filter((c) => c.status === 'upcoming'),
    ...espn.featured.filter((c) => c.status === 'upcoming'),
    ...espn.featured.filter((c) => c.status === 'completed'),
  ].slice(0, 12);

  const cards = { ...espn, cricket, featured: liveFirst };

  return (
    <section className="border-b border-[var(--sk-border)] bg-[var(--sk-bg)]">
      <LiveScoresTabs cards={cards} />
    </section>
  );
}
