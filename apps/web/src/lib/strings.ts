// UI strings are locale-driven so the same codebase serves the English and
// Bangla editions. Selection follows NEXT_PUBLIC_SITE_LOCALE (see branding.ts).
// Add new user-facing literals here instead of hardcoding them in components.
import { branding } from './branding';

type Strings = {
  latestNews: string;
  latest: string;
  viewAll: string;
  noStories: string;
  live: string;
  moreNews: (category: string) => string;
};

const STRINGS: Record<string, Strings> = {
  en: {
    latestNews: 'Latest News',
    latest: 'Latest',
    viewAll: 'View All',
    noStories: 'No stories yet.',
    live: 'Live',
    moreNews: (category) => `More ${category} News`,
  },
  bn: {
    latestNews: 'সর্বশেষ খবর',
    latest: 'সর্বশেষ',
    viewAll: 'সব দেখুন',
    noStories: 'এখনো কোনো খবর নেই।',
    live: 'লাইভ',
    moreNews: () => 'আরো পড়ুন',
  },
};

export const t: Strings = STRINGS[branding.siteLocale] ?? STRINGS.en;
