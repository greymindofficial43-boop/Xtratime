import { ArticleCard } from '@/components/ArticleCard';
import Link from 'next/link';
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await api.getCategory(slug).catch(() => null);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} News | Sportskeeda`,
    description: `Latest ${category.name} news, rumors, and analysis.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, articles, trending] = await Promise.all([
    api.getCategory(slug).catch(() => null),
    api.getArticles({ category: slug, limit: 24 }).catch(() => ({ items: [] })),
    api.getArticles({ category: slug, trending: true, limit: 5 }).catch(() => ({ items: [] })),
  ]);

  if (!category) notFound();

  const [featured, ...rest] = articles.items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center gap-2 border-b border-[var(--sk-border)] pb-4">
        <span className="text-3xl">{category.icon ?? '🏆'}</span>
        <div>
          <h1 className="text-2xl font-bold text-[var(--sk-text)] md:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-1 text-sm text-[var(--sk-muted)]">{category.description}</p>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {featured && (
            <div className="mb-8">
              <ArticleCard article={featured} size="hero" />
            </div>
          )}

          <div className="rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} size="list" />
            ))}
          </div>

          {articles.items.length === 0 && (
            <p className="py-12 text-center text-[var(--sk-muted)]">
              No articles in this category yet.
            </p>
          )}

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--sk-heading)] hover:text-[var(--sk-accent)]"
          >
            ← Back to home
          </Link>
        </div>

        <aside>
          <div className="sticky top-24 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <div className="mb-3 inline-block rounded-full border border-[var(--sk-accent)] px-3 py-0.5 text-xs font-semibold text-[var(--sk-accent)]">
              Most Popular
            </div>
            {(trending.items.length > 0 ? trending.items : articles.items)
              .slice(0, 5)
              .map((article, i) => (
                <ArticleCard key={article.id} article={article} size="numbered" rank={i + 1} />
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
