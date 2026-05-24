import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article, Category } from '@/lib/api';

type Props = {
  category: Category;
  articles: Article[];
  popular: Article[];
};

export function CategorySection({ category, articles, popular }: Props) {
  const [featured, ...rest] = articles;

  return (
    <section className="border-t border-[var(--sk-border)] py-8">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-2xl font-bold text-[var(--sk-text)]">{category.name}</h2>
        <Link
          href={`/category/${category.slug}`}
          className="text-2xl font-bold text-[var(--sk-heading)] hover:text-[var(--sk-accent)]"
          aria-label={`View all ${category.name} news`}
        >
          ›
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            {featured ? (
              <ArticleCard article={featured} size="hero" />
            ) : (
              <p className="text-sm text-[var(--sk-muted)]">No stories yet.</p>
            )}
          </div>
          <div>
            {rest.slice(0, 4).map((article) => (
              <ArticleCard key={article.id} article={article} size="list" />
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <div className="mb-3 inline-block rounded-full border border-[var(--sk-accent)] px-3 py-0.5 text-xs font-semibold text-[var(--sk-accent)]">
            Latest News
          </div>
          {popular.length > 0 ? (
            popular.slice(0, 5).map((article, i) => (
              <ArticleCard key={article.id} article={article} size="numbered" rank={i + 1} />
            ))
          ) : (
            <p className="text-sm text-[var(--sk-muted)]">No stories yet.</p>
          )}
        </aside>
      </div>

      <Link
        href={`/category/${category.slug}`}
        className="mt-6 flex w-full items-center justify-center rounded-full border border-[var(--sk-border)] px-6 py-2.5 text-sm font-medium text-[var(--sk-text)] transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
      >
        View all {category.name} News
      </Link>
    </section>
  );
}
