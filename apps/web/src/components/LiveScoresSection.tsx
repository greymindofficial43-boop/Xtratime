'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  SCORECARD_TABS,
  type ScorecardTab,
  scorecardsForTab,
} from '@/lib/scorecards';
import { ScorecardCarousel } from './ScorecardCarousel';

export function LiveScoresSection() {
  const [activeTab, setActiveTab] = useState<ScorecardTab>('featured');
  const cards = scorecardsForTab(activeTab);

  return (
    <section className="border-b border-[var(--sk-border)] bg-[var(--sk-bg)] pt-0">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-4">
        <nav className="-mb-px flex items-center justify-between border-b border-[var(--sk-border)] px-1 py-0">
          <div className="flex gap-6 overflow-x-auto sk-scrollbar-hide">
            {SCORECARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 whitespace-nowrap border-b-[3px] py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-[var(--sk-accent)] text-[var(--sk-accent)]'
                    : 'border-transparent text-[var(--sk-muted)] hover:text-[var(--sk-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            href="/schedule"
            className="shrink-0 whitespace-nowrap py-3 pl-4 text-sm font-semibold text-[var(--sk-accent)] hover:text-red-500 transition hidden sm:block"
          >
            All Fixtures ›
          </Link>
        </nav>

        <div className="py-4">
          <ScorecardCarousel cards={cards} />
        </div>
      </div>
    </section>
  );
}
