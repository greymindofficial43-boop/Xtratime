import { AD_SLOTS, GoogleAd } from '@/components/GoogleAd';
import { EspnScheduleView } from '@/components/EspnScheduleView';
import { fetchAllScheduleGames } from '@/lib/espn';

export const metadata = {
  title: 'Sports Schedule & Live Scores | Sportskeeda',
  description: 'Live scores, today\'s fixtures and results across NFL, NBA, MLB, Soccer and NHL — powered by ESPN.',
};

export default async function SchedulePage() {
  const games = await fetchAllScheduleGames();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
      <div>
        <div className="mb-6">
          <h1 className="sk-section-heading text-2xl font-black text-[var(--sk-text)]">
            Schedule &amp; Live Scores
          </h1>
          <p className="mt-1 text-sm text-[var(--sk-muted)]">
            NFL · NBA · MLB · Soccer · NHL — powered by ESPN
          </p>
        </div>
        <EspnScheduleView games={games} />
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <GoogleAd slot={AD_SLOTS.sidebar} minHeight={250} />
          </div>
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <GoogleAd slot={AD_SLOTS.inContentMid} minHeight={600} />
          </div>
        </div>
      </aside>
    </div>
  );
}
