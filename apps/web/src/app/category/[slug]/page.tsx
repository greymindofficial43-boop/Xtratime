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
                {t.mostPopular}
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

          </div>
        </aside>
      </div>
    </div>
  );
}
