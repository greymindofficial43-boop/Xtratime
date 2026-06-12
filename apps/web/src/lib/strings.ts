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
  trendingNow: string;
  trendingRightNow: string;
  mostPopular: string;
  moreNews: (category: string) => string;
  // SEO / social-preview metadata for category pages.
  categoryMetaTitle: (category: string) => string;
  categoryMetaDescription: (category: string) => string;
};

const STRINGS: Record<string, Strings> = {
  en: {
    latestNews: 'Latest News',
    latest: 'Latest',
    viewAll: 'View All',
    noStories: 'No stories yet.',
    live: 'Live',
    trendingNow: 'Trending Now',
    trendingRightNow: 'Trending Right Now',
    mostPopular: 'Most Popular',
    moreNews: (category) => `More ${category} News`,
    categoryMetaTitle: (category) => `${category} News`,
    categoryMetaDescription: (category) =>
      `Latest ${category} news, rumors, scores and analysis.`,
  },
  bn: {
    latestNews: 'সর্বশেষ খবর',
    latest: 'সর্বশেষ',
    viewAll: 'সব দেখুন',
    noStories: 'এখনো কোনো খবর নেই।',
    live: 'লাইভ',
    trendingNow: 'এখন ট্রেন্ডিং',
    trendingRightNow: 'এখন ট্রেন্ডিং',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    moreNews: () => 'আরো পড়ুন',
    categoryMetaTitle: (category) => `${category} খবর`,
    categoryMetaDescription: (category) =>
      `${category} সম্পর্কিত সর্বশেষ খবর, ট্রান্সফার গুজব, স্কোর এবং বিশ্লেষণ।`,
  },
};

export const t: Strings = STRINGS[branding.siteLocale] ?? STRINGS.en;
