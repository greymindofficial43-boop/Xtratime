import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { CricketMatchCard } from '@/components/CricketMatchCard';
import { EspnNewsCard } from '@/components/EspnNewsCard';
import { AD_SLOTS, GoogleAd } from '@/components/GoogleAd';
import { api } from '@/lib/api';
import { fetchCricketMatches } from '@/lib/cricapi';
import { fetchCategoryNews } from '@/lib/espn';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await api.getCategory(slug).catch(() => null);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} News | Sportskeeda`,
    description: `Latest ${category.name} news, rumors, scores and analysis.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, articles, trending, espnNews, cricketMatches] = await Promise.all([
    api.getCategory(slug).catch(() => null),
    api.getArticles({ category: slug, limit: 24 }).catch(() => ({ items: [] })),
    api.getArticles({ category: slug, trending: true, limit: 5 }).catch(() => ({ items: [] })),
    fetchCategoryNews(slug, 8),
    slug === 'cricket' ? fetchCricketMatches(12) : Promise.resolve([]),
  ]);

  if (!category) notFound();

  const [featured, ...rest] = articles.items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Category header */}
      <header className="mb-6 flex items-center gap-3 border-b border-[var(--sk-border)] pb-5">
        <span className="text-4xl leading-none">{category.icon ?? '🏆'}</span>
        <div>
          <h1 className="text-2xl font-black text-[var(--sk-text)] md:text-3xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-1 text-sm text-[var(--sk-muted)]">{category.description}</p>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div>
          {/* Featured (hero) article */}
          {featured && (
            <div className="mb-8">
              <ArticleCard article={featured} size="hero" />
            </div>
          )}

          {/* Article list */}
          {rest.length > 0 && (
            <div className="divide-y divide-[var(--sk-border)] rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
              {rest.map((article) => (
                <ArticleCard key={article.id} article={article} size="list" />
              ))}
            </div>
          )}

          {articles.items.length === 0 && (
            <p className="py-12 text-center text-[var(--sk-muted)]">
              No articles in this category yet.
            </p>
          )}

          {/* In-article ad */}
          <div className="my-8 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <GoogleAd slot={AD_SLOTS.inContentTop} minHeight={250} />
          </div>

          {/* Cricket live scores — only on cricket category */}
          {cricketMatches.length > 0 && (
            <section className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
                  🏏 Live &amp; Recent Matches
                </h2>
                <span className="rounded-full border border-[var(--sk-border)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--sk-muted)]">
                  CricAPI
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {cricketMatches.map((match) => (
                  <CricketMatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* ESPN news for this sport category */}
          {espnNews.length > 0 && (
            <section className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="sk-section-heading text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
                  Latest ESPN {category.name} News
                </h2>
                <span className="rounded-full border border-[var(--sk-border)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--sk-muted)]">
                  ESPN
                </span>
              </div>
              <div className="divide-y divide-[var(--sk-border)] rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
                {espnNews.map((news) => (
                  <EspnNewsCard key={news.id} news={news} size="compact" />
                ))}
              </div>
            </section>
          )}

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-[var(--sk-heading)] hover:text-[var(--sk-accent)]"
          >
            ← Back to home
          </Link>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="sticky top-24 space-y-6">
            {/* Most Popular */}
            <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-5">
              <h2 className="sk-section-heading mb-4 text-sm font-black uppercase tracking-wide text-[var(--sk-text)]">
                Most Popular
              </h2>
              {(trending.items.length > 0 ? trending.items : articles.items)
                .slice(0, 5)
                .map((article, i) => (
                  <ArticleCard key={article.id} article={article} size="numbered" rank={i + 1} />
                ))}
            </div>

            {/* Sidebar ad */}
            <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
              <GoogleAd slot={AD_SLOTS.sidebar} minHeight={250} />
            </div>

            {/* ESPN news sidebar (compact) — if different from main */}
            {espnNews.length > 4 && (
              <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
                <h3 className="sk-section-heading mb-3 text-xs font-black uppercase tracking-wide text-[var(--sk-text)]">
                  ESPN Headlines
                </h3>
                <div>
                  {espnNews.slice(4, 8).map((news) => (
                    <EspnNewsCard key={news.id} news={news} size="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
