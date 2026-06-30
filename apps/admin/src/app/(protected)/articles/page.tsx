'use client';

import { adminApi, type Article, type Category } from '@/lib/api';
import { site } from '@/lib/site';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  PUBLISHED: { bg: 'rgba(22,163,74,0.12)', text: '#16a34a', label: 'Published' },
  DRAFT:     { bg: 'rgba(217,119,6,0.12)',  text: '#d97706', label: 'Draft' },
  ARCHIVED:  { bg: 'rgba(107,114,128,0.12)',text: '#6b7280', label: 'Archived' },
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const fetcher = view === 'trash' ? adminApi.getTrash : adminApi.getArticles;
      const params: Record<string, string> = { limit: '20', page: page.toString() };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDate) params.date = selectedDate;
      if (selectedMonth) params.month = selectedMonth;

      const [res, categoryData, trash] = await Promise.all([
        fetcher(params),
        adminApi.getCategories(),
        adminApi.getTrash({ limit: '1' }),
      ]);
      setArticles(res.items);
      setTotalPages(res.totalPages || 1);
      setCategories(categoryData);
      setTrashCount(trash.total);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedCategory, selectedDate, selectedMonth, view, page]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Move "${title}" to Trash? You can restore it later.`)) return;
    try {
      await adminApi.deleteArticle(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function handleRestore(id: string) {
    try {
      await adminApi.restoreArticle(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Restore failed');
    }
  }

  async function handlePermanentDelete(id: string, title: string) {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.permanentlyDeleteArticle(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id],
    );
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.length === articles.length ? [] : articles.map((article) => article.id),
    );
  }

  async function handleBulkTrash() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Move ${selectedIds.length} selected article(s) to Trash?`)) return;
    setBulkLoading(true);
    try {
      await adminApi.bulkTrashArticles(selectedIds);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkRestore() {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await adminApi.bulkRestoreArticles(selectedIds);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk restore failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkPermanentDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} selected article(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await adminApi.bulkPermanentlyDeleteArticles(selectedIds);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleEmptyTrash() {
    if (!confirm('Permanently delete every article in Trash? This cannot be undone.')) return;
    setBulkLoading(true);
    try {
      await adminApi.emptyTrash();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Empty trash failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function toggle(id: string, field: 'isFeatured' | 'isTrending', current: boolean) {
    setToggling(`${id}-${field}`);
    try {
      await adminApi.updateArticle(id, { [field]: !current });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: !current } : a))
      );
    } finally {
      setToggling(null);
    }
  }

  const published = articles.filter((a) => a.status === 'PUBLISHED').length;
  const featured  = articles.filter((a) => a.isFeatured).length;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Articles</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
            {articles.length} total · {published} published · {featured} featured
          </p>
        </div>
        <Link
          href="/articles/new"
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--admin-accent)' }}
        >
          + New Article
        </Link>
      </div>

      {/* Active / Trash tabs */}
      <div className="mb-4 flex gap-2">
        {([['active', 'Articles'], ['trash', `Trash${trashCount ? ` (${trashCount})` : ''}`]] as const).map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition"
              style={
                view === key
                  ? { background: 'var(--admin-accent)', color: '#fff' }
                  : { background: 'var(--admin-surface)', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)' }
              }
            >
              {label}
            </button>
          ),
        )}
      </div>

      {(selectedIds.length > 0 || view === 'trash') && (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
            {selectedIds.length} selected
          </span>
          {selectedIds.length > 0 && view === 'active' && (
            <button
              type="button"
              onClick={handleBulkTrash}
              disabled={bulkLoading}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Move selected to Trash
            </button>
          )}
          {selectedIds.length > 0 && view === 'trash' && (
            <>
              <button
                type="button"
                onClick={handleBulkRestore}
                disabled={bulkLoading}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'var(--admin-accent-2)' }}
              >
                Restore selected
              </button>
              <button
                type="button"
                onClick={handleBulkPermanentDelete}
                disabled={bulkLoading}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Delete selected forever
              </button>
            </>
          )}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-sm font-semibold"
              style={{ color: 'var(--admin-muted)' }}
            >
              Clear selection
            </button>
          )}
          {view === 'trash' && trashCount > 0 && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              disabled={bulkLoading}
              className="ml-auto rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-500 disabled:opacity-60"
            >
              Empty Trash
            </button>
          )}
        </div>
      )}

      <div
        className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(event) => { setSelectedCategory(event.target.value); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          >
            <option value="">All Categories</option>
            {categories.filter((category) => !category.parentId).map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedMonth(''); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
            Month
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(''); setPage(1); }}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          />
        </div>

        {(selectedCategory || selectedDate || selectedMonth) && (
          <button
            type="button"
            onClick={() => { setSelectedCategory(''); setSelectedDate(''); setSelectedMonth(''); setPage(1); }}
            className="text-sm font-semibold"
            style={{ color: 'var(--admin-accent)' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div
          className="rounded-xl border p-12 text-center text-sm"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
        >
          Loading articles…
        </div>
      ) : articles.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            {view === 'trash' ? 'Trash is empty.' : 'No articles yet.'}
          </p>
          {view === 'active' && (
            <Link
              href="/articles/new"
              className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: 'var(--admin-accent)' }}
            >
              Create your first article
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile card list — visible below sm */}
          <div className="space-y-3 sm:hidden">
            {articles.map((article) => {
              const s = statusStyles[article.status] ?? statusStyles.DRAFT;
              return (
                <div
                  key={article.id}
                  className="rounded-xl border px-4 py-3"
                  style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="mb-2 flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(article.id)}
                      onChange={() => toggleSelected(article.id)}
                      aria-label={`Select ${article.title}`}
                      className="mt-0.5 shrink-0"
                    />
                    <p className="flex-1 text-sm font-semibold leading-snug" style={{ color: 'var(--admin-text)' }}>
                      {article.title}
                    </p>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className="rounded-full px-2.5 py-0.5 font-semibold"
                      style={{ background: `${article.category.color ?? '#e10600'}22`, color: article.category.color ?? '#e10600' }}
                    >
                      {article.category.name}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ background: s.bg, color: s.text }}>
                      {s.label}
                    </span>
                    <span style={{ color: 'var(--admin-muted)' }}>
                      {(article.publishedAt ?? article.createdAt)
                        ? new Date((article.publishedAt ?? article.createdAt) as string).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : '—'}
                    </span>
                    <button
                      onClick={() => toggle(article.id, 'isFeatured', article.isFeatured)}
                      disabled={toggling === `${article.id}-isFeatured`}
                      title={article.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                      className="text-base leading-none transition disabled:opacity-40"
                    >
                      {article.isFeatured ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => toggle(article.id, 'isTrending', article.isTrending)}
                      disabled={toggling === `${article.id}-isTrending`}
                      title={article.isTrending ? 'Remove Trending' : 'Mark Trending'}
                      className="text-base leading-none transition disabled:opacity-40"
                      style={{ filter: article.isTrending ? 'none' : 'grayscale(1)', opacity: article.isTrending ? 1 : 0.4 }}
                    >
                      🔥
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {view === 'trash' ? (
                      <>
                        <button onClick={() => handleRestore(article.id)} className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>Restore</button>
                        <button onClick={() => handlePermanentDelete(article.id, article.title)} className="text-sm font-medium text-red-500">Delete forever</button>
                      </>
                    ) : (
                      <>
                        <a href={`${site.webUrl}/${article.category.slug}/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>View</a>
                        <Link href={`/articles/${article.id}/edit`} className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>Edit</Link>
                        <button onClick={() => handleDelete(article.id, article.title)} className="text-sm font-medium text-red-500">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table — visible sm and above */}
          <div
            className="hidden overflow-x-auto rounded-xl border sm:block"
            style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
          >
            <table className="w-full text-left text-sm">
              <thead className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
                <tr>
                  <th className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={articles.length > 0 && selectedIds.length === articles.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all articles"
                    />
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Title</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Category</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Status</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Date</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-center" style={{ color: 'var(--admin-muted)' }}>Featured</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-center" style={{ color: 'var(--admin-muted)' }}>Trending</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => {
                  const s = statusStyles[article.status] ?? statusStyles.DRAFT;
                  return (
                    <tr key={article.id} className="border-b last:border-0 transition-colors" style={{ borderColor: 'var(--admin-border)' }}>
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(article.id)}
                          onChange={() => toggleSelected(article.id)}
                          aria-label={`Select ${article.title}`}
                        />
                      </td>
                      <td className="px-5 py-3" style={{ maxWidth: 280 }}>
                        <p className="line-clamp-2 text-sm font-medium leading-snug" style={{ color: 'var(--admin-text)' }}>
                          {article.title}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: `${article.category.color ?? '#e10600'}22`, color: article.category.color ?? '#e10600' }}
                        >
                          {article.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.text }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--admin-muted)' }}>
                        {(article.publishedAt ?? article.createdAt)
                          ? new Date((article.publishedAt ?? article.createdAt) as string).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggle(article.id, 'isFeatured', article.isFeatured)}
                          disabled={toggling === `${article.id}-isFeatured`}
                          title={article.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                          className="text-xl leading-none transition disabled:opacity-40"
                        >
                          {article.isFeatured ? '★' : '☆'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => toggle(article.id, 'isTrending', article.isTrending)}
                          disabled={toggling === `${article.id}-isTrending`}
                          title={article.isTrending ? 'Remove Trending' : 'Mark Trending'}
                          className="text-base leading-none transition disabled:opacity-40"
                          style={{ filter: article.isTrending ? 'none' : 'grayscale(1)', opacity: article.isTrending ? 1 : 0.4 }}
                        >
                          🔥
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          {view === 'trash' ? (
                            <>
                              <button onClick={() => handleRestore(article.id)} className="text-sm font-medium transition hover:opacity-70" style={{ color: 'var(--admin-accent-2)' }}>Restore</button>
                              <button onClick={() => handlePermanentDelete(article.id, article.title)} className="text-sm font-medium text-red-500 transition hover:text-red-700">Delete forever</button>
                            </>
                          ) : (
                            <>
                              <a href={`${site.webUrl}/${article.category.slug}/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition hover:opacity-70" style={{ color: 'var(--admin-accent-2)' }}>View</a>
                              <Link href={`/articles/${article.id}/edit`} className="text-sm font-medium transition hover:opacity-70" style={{ color: 'var(--admin-accent-2)' }}>Edit</Link>
                              <button onClick={() => handleDelete(article.id, article.title)} className="text-sm font-medium text-red-500 transition hover:text-red-700">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className="mt-6 flex items-center justify-between rounded-xl border px-4 py-3"
            style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
              Page <span className="font-bold" style={{ color: 'var(--admin-text)' }}>{page}</span> of <span className="font-bold" style={{ color: 'var(--admin-text)' }}>{totalPages || 1}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
