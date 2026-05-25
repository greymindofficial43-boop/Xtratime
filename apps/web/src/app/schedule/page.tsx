import { AdSlot } from '../../components/AdSlot';
import { ScheduleView } from '../../components/ScheduleView';

export const metadata = {
  title: 'Sports Schedule & Fixtures | Sportskeeda Clone',
  description: 'View live, upcoming, and completed sports fixtures.',
};

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-3 py-8 sm:px-4">
      <h1 className="mb-6 text-2xl font-bold text-[var(--sk-text)]">Schedule & Fixtures</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <ScheduleView />
        <aside className="space-y-6">
          <AdSlot slotId="schedule-sidebar" />
        </aside>
      </div>
    </div>
  );
}
