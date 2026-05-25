'use client';

import { adminApi } from '@/lib/api';
import { site } from '@/lib/site';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ articles: 0, categories: 0, tags: 0, published: 0 });

  useEffect(() => {
    Promise.all([
      adminApi.getArticles({ limit: '50' }),
      adminApi.getCategories(),
      adminApi.getTags(),
    ]).then(([articles, categories, tags]) => {
      setStats({
        articles: articles.total,
        published: articles.items.filter((a) => a.status === 'PUBLISHED').length,
        categories: categories.length,
        tags: tags.length,
      });
    });
  }, []);

  const cards = [
    { label: 'Total Articles', value: stats.articles, href: '/articles' },
    { label: 'Published', value: stats.published, href: '/articles' },
    { label: 'Categories', value: stats.categories, href: '/categories' },
    { label: 'Tags', value: stats.tags, href: '/tags' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-slate-500">Manage your Sportskeeda-style content platform</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[var(--admin-accent)]"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/articles/new"
            className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white"
          >
            + New Article
          </Link>
          <Link
            href="/matches"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Manage Matches
          </Link>
          <Link
            href="/ads"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Manage Ads
          </Link>
          <Link
            href="/categories"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Manage Categories
          </Link>
          <a
            href={site.webUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Preview Site
          </a>
        </div>
      </div>
    </div>
  );
}
