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
  videos: string;
  latestVideos: string;
  allVideos: string;
  noVideos: string;
  gallery: string;
  moreNews: (category: string) => string;
  // Footer strings
  footerTagline: string;
  footerCategories: string;
  footerNewsletterHeading: string;
  footerNewsletterBody: string;
  footerEmailPlaceholder: string;
  footerSubscribe: string;
  footerAllRightsReserved: string;
  footerPrivacy: string;
  footerTerms: string;
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
    videos: 'Videos',
    latestVideos: 'Latest Videos',
    allVideos: 'All Videos',
    noVideos: 'No videos found.',
    gallery: 'Gallery',
    moreNews: (category) => `More ${category} News`,
    footerTagline: 'Latest cricket, football and more — news, scores and analysis.',
    footerCategories: 'Categories',
    footerNewsletterHeading: 'Stay Updated',
    footerNewsletterBody: 'Get the latest sports news delivered to your inbox.',
    footerEmailPlaceholder: 'Your email',
    footerSubscribe: 'Subscribe',
    footerAllRightsReserved: 'All rights reserved',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
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
    videos: 'ভিডিও',
    latestVideos: 'সর্বশেষ ভিডিও',
    allVideos: 'সব ভিডিও',
    noVideos: 'ভিডিও পাওয়া যায়নি।',
    gallery: 'গ্যালারি',
    moreNews: () => 'আরো পড়ুন',
    footerTagline: 'ক্রিকেট, ফুটবল এবং আরও খেলার সর্বশেষ খবর, লাইভ স্কোর ও বিশ্লেষণ।',
    footerCategories: 'বিভাগ',
    footerNewsletterHeading: 'আপডেট পান',
    footerNewsletterBody: 'সর্বশেষ খেলার খবর সরাসরি আপনার ইনবক্সে পান।',
    footerEmailPlaceholder: 'আপনার ইমেইল',
    footerSubscribe: 'যোগ দিন',
    footerAllRightsReserved: 'সকল অধিকার সংরক্ষিত',
    footerPrivacy: 'গোপনীয়তা',
    footerTerms: 'শর্তাবলী',
    categoryMetaTitle: (category) => `${category} খবর`,
    categoryMetaDescription: (category) =>
      `${category} সম্পর্কিত সর্বশেষ খবর, ট্রান্সফার গুজব, স্কোর এবং বিশ্লেষণ।`,
  },
};

export const t: Strings = STRINGS[branding.siteLocale] ?? STRINGS.en;
