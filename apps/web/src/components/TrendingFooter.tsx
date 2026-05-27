import Link from 'next/link';
import { api } from '@/lib/api';

export async function TrendingFooter() {
  const articlesRes = await api.getArticles({ trending: true, limit: 4 }).catch(() => null);
  const articles = articlesRes?.items || [];

  if (articles.length === 0) return null;

  return (
    <section className="border-t border-[var(--sk-border)] bg-[var(--sk-surface)] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-[var(--sk-text)]">
          <span className="text-[var(--sk-accent)]">🔥</span> Trending Right Now
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="group flex flex-col rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface-elevated)] p-4 shadow-sm transition hover:border-[var(--sk-accent)] hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: article.category.color || 'var(--sk-accent)' }}
                >
                  {article.category.name}
                </span>
                <span className="text-[11px] font-medium text-[var(--sk-muted)]">
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                    undefined,
                    { month: 'short', day: 'numeric' }
                  )}
                </span>
              </div>
              <h3 className="mb-2 line-clamp-3 text-sm font-bold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="line-clamp-2 text-xs text-[var(--sk-muted)]">
                  {article.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
