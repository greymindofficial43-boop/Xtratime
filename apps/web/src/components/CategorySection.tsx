import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article, Category } from '@/lib/api';
import { t } from '@/lib/strings';

type Props = {
  category: Category;
  articles: Article[];
  popular: Article[];
};

export function CategorySection({ category, articles, popular }: Props) {
  const [featured, ...rest] = articles;

  return (
    <section className="border-t border-[var(--sk-border)] py-8">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="sk-section-heading flex items-center gap-2">
          {category.icon && (
            <span className="text-xl leading-none">{category.icon}</span>
          )}
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--sk-text)]">
            {category.name}
          </h2>
        </div>
        <Link
          href={`/category/${category.slug}`}
          className="sk-view-all-btn"
          aria-label={`View all ${category.name} news`}
        >
          {t.viewAll} <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Main: hero + list articles */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            {featured ? (
              <ArticleCard article={featured} size="hero" />
            ) : (
              <p className="text-sm text-[var(--sk-muted)]">{t.noStories}</p>
            )}
          </div>
          <div className="divide-y divide-[var(--sk-border)]">
            {rest.slice(0, 4).map((article) => (
              <ArticleCard key={article.id} article={article} size="list" />
            ))}
          </div>
        </div>

        {/* Sidebar: latest/popular */}
        <aside className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="sk-cat-badge text-[9px]">{t.latest}</span>
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
        className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--sk-border)] bg-[var(--sk-surface)] px-6 py-2 text-xs font-bold uppercase tracking-wider text-[var(--sk-muted)] transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
      >
        {t.moreNews(category.name)} ›
      </Link>
    </section>
  );
}
