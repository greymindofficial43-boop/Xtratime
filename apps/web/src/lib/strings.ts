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
  galleryPageTitle: string;
  galleryEmpty: string;
  galleryPrevPage: string;
  galleryNextPage: string;
  galleryMetaTitle: string;
  galleryMetaDescription: string;
  // Article page
  by: string;
  published: string;
  relatedStories: string;
  moreFrom: string;
  // Category page
  breadcrumbHome: string;
  noArticlesInCategory: string;
  backToHome: string;
  // Search page
  searchTitle: string;
  searchPrompt: string;
  searchResultsFor: (q: string) => string;
  searchArticlesFound: (n: number) => string;
  searchNoResults: string;
  // Mobile nav
  followUs: string;
  theme: string;
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
    galleryPageTitle: 'Photo Gallery',
    galleryEmpty: 'No galleries yet.',
    galleryPrevPage: '← Previous Page',
    galleryNextPage: 'Next Page →',
    galleryMetaTitle: 'Photo Gallery | XtraTime',
    galleryMetaDescription: 'Browse the latest photo galleries from XtraTime.',
    by: 'By',
    published: 'Published',
    relatedStories: 'Related stories',
    moreFrom: 'More from',
    breadcrumbHome: 'Home',
    noArticlesInCategory: 'No articles in this category yet.',
    backToHome: '← Back to home',
    searchTitle: 'Search',
    searchPrompt: 'Enter a search term from the header.',
    searchResultsFor: (q) => `Results for "${q}"`,
    searchArticlesFound: (n) => `${n} articles found`,
    searchNoResults: 'No articles match your search.',
    followUs: 'Follow us',
    theme: 'Theme',
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
    galleryPageTitle: 'ফটো গ্যালারি',
    galleryEmpty: 'এখনো কোনো গ্যালারি নেই।',
    galleryPrevPage: '← আগের পাতা',
    galleryNextPage: 'পরের পাতা →',
    galleryMetaTitle: 'ফটো গ্যালারি | XtraTime Bangla',
    galleryMetaDescription: 'XtraTime Bangla-এর সর্বশেষ ফটো গ্যালারি।',
    by: 'লিখেছেন',
    published: 'প্রকাশিত',
    relatedStories: 'সম্পর্কিত খবর',
    moreFrom: 'আরও পড়ুন',
    breadcrumbHome: 'হোম',
    noArticlesInCategory: 'এই বিভাগে এখনো কোনো খবর নেই।',
    backToHome: '← হোমে ফিরুন',
    searchTitle: 'অনুসন্ধান',
    searchPrompt: 'হেডার থেকে অনুসন্ধান করুন।',
    searchResultsFor: (q) => `"${q}" এর ফলাফল`,
    searchArticlesFound: (n) => `${n}টি খবর পাওয়া গেছে`,
    searchNoResults: 'কোনো খবর পাওয়া যায়নি।',
    followUs: 'আমাদের ফলো করুন',
    theme: 'থিম',
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
