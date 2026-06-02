'use client';

import { adminApi, type Article, type Category } from '@/lib/api';
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
  const [selectedCategory, setSelectedCategory] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [res, categoryData] = await Promise.all([
        adminApi.getArticles({ limit: '50', ...(selectedCategory ? { category: selectedCategory } : {}) }),
        adminApi.getCategories(),
      ]);
      setArticles(res.items);
      setCategories(categoryData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedCategory]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await adminApi.deleteArticle(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Articles</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
            {articles.length} total · {published} published · {featured} featured
          </p>
        </div>
        <Link
          href="/articles/new"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--admin-accent)' }}
        >
          + New Article
        </Link>
      </div>

      <div
        className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          Filter By Category
        </label>
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
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
        {selectedCategory && (
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className="text-sm font-semibold"
            style={{ color: 'var(--admin-accent)' }}
          >
            Clear
          </button>
        )}
      </div>

      <div
        className="overflow-x-auto rounded-xl border"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--admin-muted)' }}>
            Loading articles…
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>No articles yet.</p>
            <Link
              href="/articles/new"
              className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ background: 'var(--admin-accent)' }}
            >
              Create your first article
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Title</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Category</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Status</th>
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
                    <td className="px-5 py-3" style={{ maxWidth: 280 }}>
                      <p
                        className="line-clamp-2 text-sm font-medium leading-snug"
                        style={{ color: 'var(--admin-text)' }}
                      >
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
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {s.label}
                      </span>
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
                        <Link
                          href={`/articles/${article.id}/edit`}
                          className="text-sm font-medium transition hover:opacity-70"
                          style={{ color: 'var(--admin-accent-2)' }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
