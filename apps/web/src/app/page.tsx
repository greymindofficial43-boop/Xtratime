import { ArticleCard } from '@/components/ArticleCard';
import { CategorySection } from '@/components/CategorySection';
import { LiveScoresSection } from '@/components/LiveScoresSection';
import { PromoBanner } from '@/components/PromoBanner';
import { api } from '@/lib/api';

const HOME_SECTION_SLUGS = ['wwe', 'cricket', 'nba', 'nfl', 'football', 'gaming'];

export default async function HomePage() {
  const categories = await api.getCategories().catch(() => []);
  const latest = await api.getArticles({ limit: 20 }).catch(() => ({ items: [] }));
  const trending = await api.getArticles({ trending: true, limit: 5 }).catch(() => ({ items: [] }));

  const topStories = latest.items.slice(0, 4);
  const moreStories = latest.items.slice(4, 10);
  const moreFeatured = moreStories[0];
  const moreList = moreStories.slice(1);

  const sectionCategories = HOME_SECTION_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter(Boolean) as typeof categories;

  const sectionData = await Promise.all(
    sectionCategories.map(async (cat) => {
      const articles = await api
        .getArticles({ category: cat.slug, limit: 6 })
        .catch(() => ({ items: [] }));
      const popular = await api
        .getArticles({ category: cat.slug, trending: true, limit: 5 })
        .catch(() => ({ items: [] }));
      return { category: cat, articles: articles.items, popular: popular.items };
    }),
  );

  return (
    <>
      <LiveScoresSection />

      <div className="mx-auto max-w-7xl px-4 py-5">
        <h1 className="sr-only">Sportskeeda — Sports, Entertainment, Gaming News</h1>

        {topStories.length > 0 ? (
          <section className="flex gap-4 overflow-x-auto pb-2 sk-scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {topStories.map((article) => (
              <ArticleCard key={article.id} article={article} size="grid" />
            ))}
          </section>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--sk-border)] p-16 text-center text-[var(--sk-muted)]">
            No articles yet. Add content from the admin panel.
          </div>
        )}

        {moreFeatured && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-[var(--sk-heading)]">More Stories</h2>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <ArticleCard article={moreFeatured} size="hero" />
              <div className="rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
                {moreList.map((article) => (
                  <ArticleCard key={article.id} article={article} size="list" />
                ))}
              </div>
            </div>
          </section>
        )}

        <PromoBanner />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            {sectionData.map(({ category, articles, popular }) => (
              <CategorySection
                key={category.id}
                category={category}
                articles={articles}
                popular={popular.length > 0 ? popular : articles}
              />
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
              <h2 className="mb-4 text-lg font-bold text-[var(--sk-text)]">Trending Now</h2>
              {trending.items.length > 0 ? (
                trending.items.map((article, i) => (
                  <ArticleCard key={article.id} article={article} size="numbered" rank={i + 1} />
                ))
              ) : (
                <p className="text-sm text-[var(--sk-muted)]">No trending stories yet.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
