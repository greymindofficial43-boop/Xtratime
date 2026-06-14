import { ArticleCard } from '@/components/ArticleCard';
import { api } from '@/lib/api';
import { t } from '@/lib/strings';

export const revalidate = 0;

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query
    ? await api.searchArticles(query).catch(() => ({ items: [], total: 0 }))
    : { items: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-[var(--sk-heading)]">{t.searchTitle}</h1>
      <p className="mt-1 text-[var(--sk-muted)]">
        {query ? t.searchResultsFor(query) : t.searchPrompt}
      </p>

      {query && (
        <p className="mt-2 text-sm text-[var(--sk-muted)]">{t.searchArticlesFound(results.total)}</p>
      )}

      <div className="mt-6 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
        {results.items.map((article) => (
          <ArticleCard key={article.id} article={article} size="list" />
        ))}
      </div>

      {query && results.items.length === 0 && (
        <p className="mt-8 text-center text-[var(--sk-muted)]">{t.searchNoResults}</p>
      )}
    </div>
  );
}
