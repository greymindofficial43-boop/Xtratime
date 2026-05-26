import { AD_SLOTS, GoogleAd } from '@/components/GoogleAd';

export const metadata = {
  title: 'Points Table & Standings | Sportskeeda',
  description: 'Latest points table and standings for live tournaments.',
};

export default function StandingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
      <div>
        <div className="mb-6">
          <h1 className="sk-section-heading text-2xl font-black text-[var(--sk-text)]">
            Tournament Standings
          </h1>
          <p className="mt-1 text-sm text-[var(--sk-muted)]">
            Current points table and net run rate for the active tournament
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-dashed border-[var(--sk-border)] bg-[var(--sk-surface)] p-12 text-center text-[var(--sk-muted)] shadow-sm">
          Standings data is not currently provided by the live API feed.
        </div>
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
