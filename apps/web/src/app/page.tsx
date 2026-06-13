import type { ReactNode } from 'react';
import Link from 'next/link';
import { AdSlot } from '@/components/AdSlot';
import { ArticleCard } from '@/components/ArticleCard';
import { CategorySection } from '@/components/CategorySection';
import { PromoBanner } from '@/components/PromoBanner';
import { api, type Article } from '@/lib/api';
import { t } from '@/lib/strings';
import { fetchYouTubeVideos } from '@/lib/youtube-feed';

// Fallback sections, used only until categories are flagged "Show on homepage" in the admin.
const FALLBACK_SECTION_SLUGS = ['wwe', 'cricket', 'nba', 'nfl', 'football', 'gaming'];

// Default homepage block order/titles — used when the admin config is missing
// (e.g. before the HomeSection migration runs) so the page always renders.
const DEFAULT_SECTION_ORDER = [
  'top-stories',
  'more-stories',
  'promo',
  'category-sections',
  'trending',
];
const DEFAULT_TITLES: Record<string, string> = {
  'top-stories': 'Top Stories',
  'more-stories': 'More Stories',
  promo: 'Promo Banner',
  'category-sections': 'Category Sections',
  trending: t.trendingNow,
};

// Keep the first occurrence of each article id, preserving order. Used to put
// editor-featured articles ahead of the newest-first fallback without dupes.
function dedupeById(items: Article[]): Article[] {
  const seen = new Set<string>();
  return items.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

export default async function HomePage() {
  const [categories, latest, featured, trending, homeSections, youtubeVideos] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getArticles({ limit: 20 }).catch(() => ({ items: [] })),
    api.getArticles({ featured: true, limit: 10 }).catch(() => ({ items: [] })),
    api.getArticles({ trending: true, limit: 5 }).catch(() => ({ items: [] })),
    api.getHomeSections().catch(() => []),
    fetchYouTubeVideos().catch(() => []),
  ]);

  // Admin-controlled homepage config (show/hide, order, custom titles). Falls
  // back to sensible defaults for any block the admin hasn't configured.
  const byKey = new Map(homeSections.map((s) => [s.key, s]));
  const enabled = (key: string) => byKey.get(key)?.enabled ?? true;
  const title = (key: string) => byKey.get(key)?.title || DEFAULT_TITLES[key] || '';
  const orderOf = (key: string) => byKey.get(key)?.sortOrder ?? DEFAULT_SECTION_ORDER.indexOf(key);

  // Editor-controlled placement: articles flagged "Featured" (★) in the admin
  // fill the large hero slots first (Top Stories, then More Stories hero);
  // everything else falls back to newest-first so the homepage is never empty.
  const ordered = dedupeById([...featured.items, ...latest.items]);
  const topStories = ordered.slice(0, 4);
  const moreStories = ordered.slice(4, 10);
  const moreFeatured = moreStories[0];
  const moreList = moreStories.slice(1);

  // Categories flagged "Show on homepage" (admin), ordered; fall back to the
  // default slugs until any are flagged so the homepage is never empty.
  const flagged = categories
    .filter((c) => c.showOnHomepage)
    .sort((a, b) => (a.homepageOrder ?? 99) - (b.homepageOrder ?? 99));

  const sectionCategories =
    flagged.length > 0
      ? flagged
      : (FALLBACK_SECTION_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
          Boolean,
        ) as typeof categories);

  const sectionData = await Promise.all(
    sectionCategories.map(async (cat) => {
      const [articles, popular] = await Promise.all([
        api.getArticles({ category: cat.slug, limit: 6 }).catch(() => ({ items: [] })),
        api.getArticles({ category: cat.slug, trending: true, limit: 5 }).catch(() => ({ items: [] })),
      ]);
      // A Featured (★) article in this category takes the section's hero slot;
      // otherwise the newest article does.
      const catFeatured = featured.items.filter((a) => a.category.slug === cat.slug);
      return {
        category: cat,
        articles: dedupeById([...catFeatured, ...articles.items]),
        popular: popular.items,
      };
    }),
  );

  const customSectionData = await Promise.all(
    homeSections
      .filter((section) => section.enabled && section.type === 'CUSTOM_CATEGORY' && section.category)
      .map(async (section) => {
        const category = section.category!;
        const limit = section.articleLimit ?? 6;
        const [articles, popular] = await Promise.all([
          api.getArticles({ category: category.slug, limit }).catch(() => ({ items: [] })),
          api.getArticles({ category: category.slug, trending: true, limit: 5 }).catch(() => ({ items: [] })),
        ]);
        return {
          section,
          category: { ...category, name: section.title },
          articles: articles.items,
          popular: popular.items,
        };
      }),
  );

  const sidebar = (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <AdSlot zone="sidebar" />
        </div>
        {enabled('trending') && (
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-5">
            <h2 className="sk-section-heading mb-4 text-sm font-black uppercase tracking-wide text-[var(--sk-text)]">
              {title('trending')}
            </h2>
            {trending.items.length > 0 ? (
              <div className="space-y-0.5">
                {trending.items.map((article, i) => (
                  <ArticleCard key={article.id} article={article} size="numbered" rank={i + 1} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--sk-muted)]">No trending stories yet.</p>
            )}
          </div>
        )}
        <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <AdSlot zone="sidebar" />
        </div>
      </div>
    </aside>
  );

  // Build the reorderable main-column blocks. Live Scores (top, full-width) and
  // Trending (sidebar) keep fixed positions and are handled separately.
  const blocks: { key: string; node: ReactNode }[] = [];

  if (enabled('top-stories') && topStories.length > 0) {
    blocks.push({
      key: 'top-stories',
      node: (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
              {title('top-stories')}
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 sk-scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {topStories.map((article) => (
              <ArticleCard key={article.id} article={article} size="grid" />
            ))}
          </div>
        </section>
      ),
    });
  }

  if (enabled('more-stories') && moreFeatured) {
    blocks.push({
      key: 'more-stories',
      node: (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
              {title('more-stories')}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <ArticleCard article={moreFeatured} size="hero" />
            <div className="divide-y divide-[var(--sk-border)] rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
              {moreList.map((article) => (
                <ArticleCard key={article.id} article={article} size="list" />
              ))}
            </div>
          </div>
        </section>
      ),
    });
  }

  if (enabled('promo')) {
    blocks.push({ key: 'promo', node: <PromoBanner /> });
  }

  if (enabled('category-sections')) {
    const visibleSections = sectionData.filter(({ articles }) => articles.length > 0);
    if (visibleSections.length > 0) {
      blocks.push({
        key: 'category-sections',
        node: (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-0">
              {visibleSections.map(({ category, articles, popular }, idx, arr) => (
                <div key={category.id}>
                  <CategorySection
                    category={category}
                    articles={articles}
                    popular={popular.length > 0 ? popular : articles}
                  />
                  {(idx + 1) % 2 === 0 && idx < arr.length - 1 && (
                    <div className="my-4 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
                      <AdSlot zone="home-infeed" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {sidebar}
          </div>
        ),
      });
    }
  }

  customSectionData
    .filter(({ articles }) => articles.length > 0)
    .forEach(({ section, category, articles, popular }) => {
      blocks.push({
        key: section.key,
        node: (
          <CategorySection
            category={category}
            articles={articles}
            popular={popular.length > 0 ? popular : articles}
          />
        ),
      });
    });

  if (youtubeVideos.length > 0) {
    const homeVideos = youtubeVideos.slice(0, 6);
    blocks.push({
      key: 'youtube-videos',
      node: (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white ml-0.5">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
                {t.latestVideos}
              </h2>
            </div>
            <Link
              href="/videos"
              className="text-xs font-semibold text-[var(--sk-accent)] hover:underline"
            >
              {t.viewAll} →
            </Link>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {homeVideos.map((v) => (
              <a
                key={v.videoId}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] hover:border-[var(--sk-accent)] transition"
              >
                <div className="relative aspect-video bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/90">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white ml-0.5">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold line-clamp-2 leading-snug">{v.title}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ),
    });
  }

  blocks.sort((a, b) => orderOf(a.key) - orderOf(b.key));

  return (
    <>
      {/* Leaderboard ad (top of homepage) */}
      <div className="border-b border-[var(--sk-border)] bg-[var(--sk-surface)] px-4 py-3">
        <div className="mx-auto max-w-[970px]">
          <AdSlot zone="home-top" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Xtra Time — Sports, Entertainment, Gaming News</h1>

        {blocks.length > 0 ? (
          <div className="space-y-10">
            {blocks.map((block, idx) => (
              <div key={block.key}>
                {block.node}
                {/* In-content ad after the first block */}
                {idx === 0 && (
                  <div className="mt-8 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
                    <AdSlot zone="home-infeed" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--sk-border)] p-16 text-center text-[var(--sk-muted)]">
            No content to show yet — add articles or enable sections from the admin panel.
          </div>
        )}

        {/* Footer banner ad */}
        <div className="mt-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <AdSlot zone="home-bottom" />
        </div>
      </div>
    </>
  );
}
