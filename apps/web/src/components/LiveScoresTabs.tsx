'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { SportCards } from '@/lib/espn';
import { SCORECARD_TABS, type ScorecardTab } from '@/lib/scorecards';
import { ScorecardCarousel } from './ScorecardCarousel';

export function LiveScoresTabs({ cards }: { cards: SportCards }) {
  const [activeTab, setActiveTab] = useState<ScorecardTab>('featured');

  const tabCards = cards[activeTab] ?? [];
  const hasLive = (tab: ScorecardTab) => (cards[tab] ?? []).some((c) => c.status === 'live');

  return (
    <div className="mx-auto max-w-[1440px] px-3 sm:px-4">
      <nav className="-mb-px flex items-center justify-between border-b border-[var(--sk-border)] px-1">
        <div className="flex gap-5 overflow-x-auto sk-scrollbar-hide">
          {SCORECARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 whitespace-nowrap border-b-[3px] py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'border-[var(--sk-accent)] text-[var(--sk-accent)]'
                  : 'border-transparent text-[var(--sk-muted)] hover:text-[var(--sk-text)]'
              }`}
            >
              {tab.label}
              {hasLive(tab.id) && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </div>
        <Link
          href="/schedule"
          className="hidden shrink-0 whitespace-nowrap py-3 pl-4 text-sm font-semibold text-[var(--sk-accent)] transition hover:text-[var(--sk-accent-hover)] sm:block"
        >
          All Fixtures ›
        </Link>
      </nav>

      <div className="py-4">
        {tabCards.length > 0 ? (
          <ScorecardCarousel cards={tabCards} />
        ) : (
          <p className="py-6 text-center text-sm text-[var(--sk-muted)]">
            No games scheduled right now — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
