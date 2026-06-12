import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { AdSlot } from '@/components/AdSlot';
import { api } from '@/lib/api';
import { t } from '@/lib/strings';
import { Fragment } from 'react';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await api.getCategory(slug).catch(() => null);
  if (!category) return { title: 'Category Not Found' };

  const title = t.categoryMetaTitle(category.name);
  const description = t.categoryMetaDescription(category.name);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title,
    description,
    // Set openGraph/twitter explicitly so social previews use the localized
    // category title instead of inheriting the site-wide default.
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}/category/${category.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: `${siteUrl}/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category = await api.getCategory(slug).catch(() => null);

  if (!category) {
    category = {
      id: slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase(),
      slug: slug,
      description: `Latest news, scores and updates for ${slug}`,
      icon: '🏆',
    };
  }

  const [articles, trending] = await Promise.all([
    api.getArticles({ category: slug, limit: 24 }).catch(() => ({ items: [] })),
    api.getArticles({ category: slug, trending: true, limit: 5 }).catch(() => ({ items: [] })),
  ]);

  const [featured, ...rest] = articles.items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-xs font-semibold text-[var(--sk-muted)]">
        <Link href="/" className="hover:text-[var(--sk-text)]">
          Home
        </Link>
        {' > '}
        <span className="text-[var(--sk-text)]">{category.name} News</span>
      </div>

      {/* Category header */}
      <header className="mb-6 flex items-center gap-3 pb-2">
        <h1 className="text-3xl font-black text-[var(--sk-text)] md:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <span className="mt-2 text-sm text-[var(--sk-muted)] hidden md:inline-block">
            — {category.description}
          </span>
        )}
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

          {/* Article list with dynamic Ads injected every 3 items */}
          {rest.length > 0 && (
            <div className="divide-y divide-[var(--sk-border)] rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
              {rest.map((article, index) => (
                <Fragment key={article.id}>
                  <ArticleCard article={article} size="list" />

                  {/* Inject ad every 3 articles */}
                  {(index + 1) % 3 === 0 && (
                    <div className="py-4">
                      <AdSlot zone="category" className="border-none shadow-none" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          )}

          {articles.items.length === 0 && (
            <p className="py-12 text-center text-[var(--sk-muted)]">
              No articles in this category yet.
            </p>
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
              <AdSlot zone="sidebar" />
            </div>

            {/* Player Stats widget (cricket only) */}
            {slug === 'cricket' && (
              <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--sk-border)] flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(126,34,206,0.1))' }}
                >
                  <h3 className="text-sm font-black uppercase tracking-wide text-[var(--sk-text)]">
                    Player Stats
                  </h3>
                  <Link href="/players" className="text-xs font-bold text-[var(--sk-accent)] hover:opacity-80">
                    View All →
                  </Link>
                </div>
                <div className="divide-y divide-[var(--sk-border)]">
                  {[
                    { id: 'c61d247d-7f77-452c-b495-2813a9cd0ac4', name: 'Virat Kohli', country: 'India', flag: '🇮🇳' },
                    { id: '6da70c66-7cf5-4c8c-aba8-54b2a87f51d3', name: 'Rohit Sharma', country: 'India', flag: '🇮🇳' },
                    { id: '22e8f6f8-be4e-4c55-bc66-50b73aba4d7e', name: 'MS Dhoni', country: 'India', flag: '🇮🇳' },
                    { id: '612c0606-76dc-4f61-9416-41a7d0bee9f0', name: 'Babar Azam', country: 'Pakistan', flag: '🇵🇰' },
                    { id: '9f75a33f-a4c2-4d19-a88b-f43b56cc0cce', name: 'Steve Smith', country: 'Australia', flag: '🇦🇺' },
                  ].map((p) => (
                    <Link
                      key={p.id}
                      href={`/players/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--sk-border)]/30 transition group"
                    >
                      <span className="text-lg">{p.flag}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--sk-text)] group-hover:text-[var(--sk-accent)] transition truncate">{p.name}</p>
                        <p className="text-[10px] text-[var(--sk-muted)]">{p.country}</p>
                      </div>
                      <svg className="text-[var(--sk-muted)] opacity-0 group-hover:opacity-100 transition shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[var(--sk-border)]">
                  <Link
                    href="/players"
                    className="block rounded-lg bg-[var(--sk-accent)] px-4 py-2.5 text-center text-xs font-bold text-white hover:opacity-90 transition"
                  >
                    Search All Players
                  </Link>
                </div>
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  );
}
