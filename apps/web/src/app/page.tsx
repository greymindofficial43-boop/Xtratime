import { AD_SLOTS, GoogleAd } from '@/components/GoogleAd';
import { ArticleCard } from '@/components/ArticleCard';
import { CategorySection } from '@/components/CategorySection';
import { EspnNewsCard } from '@/components/EspnNewsCard';
import { LiveScoresSection } from '@/components/LiveScoresSection';
import { PromoBanner } from '@/components/PromoBanner';
import { api } from '@/lib/api';
import { fetchHomepageNews } from '@/lib/espn';

const HOME_SECTION_SLUGS = ['wwe', 'cricket', 'nba', 'nfl', 'football', 'gaming'];

export default async function HomePage() {
  const [categories, latest, trending, espnNews] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getArticles({ limit: 20 }).catch(() => ({ items: [] })),
    api.getArticles({ trending: true, limit: 5 }).catch(() => ({ items: [] })),
    fetchHomepageNews(4),
  ]);

  const topStories = latest.items.slice(0, 4);
  const moreStories = latest.items.slice(4, 10);
  const moreFeatured = moreStories[0];
  const moreList = moreStories.slice(1);

  const sectionCategories = HOME_SECTION_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter(Boolean) as typeof categories;

  const sectionData = await Promise.all(
    sectionCategories.map(async (cat) => {
      const [articles, popular] = await Promise.all([
        api.getArticles({ category: cat.slug, limit: 6 }).catch(() => ({ items: [] })),
        api.getArticles({ category: cat.slug, trending: true, limit: 5 }).catch(() => ({ items: [] })),
      ]);
      return { category: cat, articles: articles.items, popular: popular.items };
    }),
  );

  return (
    <>
      <LiveScoresSection />

      {/* Leaderboard ad below live scores */}
      <div className="border-b border-[var(--sk-border)] bg-[var(--sk-surface)] px-4 py-3">
        <GoogleAd
          slot={AD_SLOTS.leaderboard}
          format="horizontal"
          minHeight={90}
          className="mx-auto max-w-[970px]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Sportskeeda — Sports, Entertainment, Gaming News</h1>

        {/* Top Stories */}
        {topStories.length > 0 ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
                Top Stories
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 sk-scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
              {topStories.map((article) => (
                <ArticleCard key={article.id} article={article} size="grid" />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--sk-border)] p-16 text-center text-[var(--sk-muted)]">
            No articles yet — add content from the admin panel.
          </div>
        )}

        {/* In-content ad */}
        <div className="my-8 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <GoogleAd slot={AD_SLOTS.inContentTop} minHeight={280} />
        </div>

        {/* More Stories (admin articles) */}
        {moreFeatured && (
          <section className="mt-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
                More Stories
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
        )}

        <PromoBanner />

        {/* Main grid: category sections + sidebar */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-0">
            {sectionData.map(({ category, articles, popular }, idx) => (
              <div key={category.id}>
                <CategorySection
                  category={category}
                  articles={articles}
                  popular={popular.length > 0 ? popular : articles}
                />
                {(idx + 1) % 2 === 0 && idx < sectionData.length - 1 && (
                  <div className="my-4 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
                    <GoogleAd slot={AD_SLOTS.inContentMid} minHeight={250} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
                <GoogleAd slot={AD_SLOTS.sidebar} minHeight={250} />
              </div>
              <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-5">
                <h2 className="sk-section-heading mb-4 text-sm font-black uppercase tracking-wide text-[var(--sk-text)]">
                  Trending Now
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
              <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
                <GoogleAd slot={AD_SLOTS.inContentMid} minHeight={600} />
              </div>
            </div>
          </aside>
        </div>

        {/* ESPN News Section */}
        {espnNews.length > 0 && (
          <section className="mt-10 border-t border-[var(--sk-border)] pt-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="sk-section-heading text-xl font-black uppercase tracking-tight text-[var(--sk-text)]">
                Latest from ESPN
              </h2>
              <span className="rounded-full border border-[var(--sk-border)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--sk-muted)]">
                ESPN
              </span>
            </div>
            {/* Hero + grid layout */}
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <EspnNewsCard news={espnNews[0]} size="hero" />
              <div className="grid gap-4 sm:grid-cols-2">
                {espnNews.slice(1, 5).map((news) => (
                  <EspnNewsCard key={news.id} news={news} />
                ))}
              </div>
            </div>
            {/* Second row */}
            {espnNews.length > 5 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {espnNews.slice(5, 9).map((news) => (
                  <EspnNewsCard key={news.id} news={news} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer banner ad */}
        <div className="mt-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <GoogleAd slot={AD_SLOTS.footerBanner} format="horizontal" minHeight={90} />
        </div>
      </div>
    </>
  );
}
