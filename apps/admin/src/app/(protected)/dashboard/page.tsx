'use client';

import { adminApi } from '@/lib/api';
import { site } from '@/lib/site';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0, published: 0, draft: 0, featured: 0, trending: 0, categories: 0, navCategories: 0,
  });

  useEffect(() => {
    Promise.all([
      adminApi.getArticles({ limit: '100' }),
      adminApi.getCategories(),
    ]).then(([articles, cats]) => {
      const items = articles.items;
      setStats({
        total:         articles.total,
        published:     items.filter((a) => a.status === 'PUBLISHED').length,
        draft:         items.filter((a) => a.status === 'DRAFT').length,
        featured:      items.filter((a) => a.isFeatured).length,
        trending:      items.filter((a) => a.isTrending).length,
        categories:    cats.length,
        navCategories: cats.filter((c) => c.showInNav).length,
      });
    });
  }, []);

  const statCards = [
    { label: 'Total Articles', value: stats.total,         href: '/articles',    color: '#3b82f6' },
    { label: 'Published',      value: stats.published,     href: '/articles',    color: '#16a34a' },
    { label: 'Drafts',         value: stats.draft,         href: '/articles',    color: '#d97706' },
    { label: 'Featured',       value: stats.featured,      href: '/articles',    color: '#f04522' },
    { label: 'Trending',       value: stats.trending,      href: '/articles',    color: '#8b5cf6' },
    { label: 'Categories',     value: stats.categories,    href: '/categories',  color: '#0891b2' },
    { label: 'In Nav',         value: stats.navCategories, href: '/categories',  color: '#059669' },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
          Welcome back 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          Here&apos;s an overview of your SportyNewz content.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border p-5 transition hover:shadow-md"
            style={{
              background: 'var(--admin-surface)',
              borderColor: 'var(--admin-border)',
              boxShadow: 'var(--admin-shadow)',
            }}
          >
            <div
              className="mb-3 h-1 w-8 rounded-full"
              style={{ background: card.color }}
            />
            <p className="text-3xl font-black" style={{ color: card.color }}>{card.value}</p>
            <p className="mt-1 text-sm font-medium" style={{ color: 'var(--admin-muted)' }}>{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div
        className="mt-8 rounded-xl border p-6"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/articles/new"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--admin-accent)' }}
          >
            + New Article
          </Link>
          <Link
            href="/categories"
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          >
            Manage Nav
          </Link>
          <Link
            href="/ads"
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          >
            Ad Slots
          </Link>
          <Link
            href="/matches"
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          >
            Matches
          </Link>
          <a
            href={site.webUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          >
            ↗ Preview Site
          </a>
        </div>
      </div>

      {/* Help */}
      <div
        className="mt-6 rounded-xl border p-5"
        style={{ background: 'rgba(240,69,34,0.06)', borderColor: 'rgba(240,69,34,0.2)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--admin-accent)' }}>
          💡 How to control the navbar
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          Go to <strong>Categories &amp; Nav</strong> → toggle the switch next to any category to add/remove it from the site&apos;s top navigation. Use the <em>Nav Order</em> number to control the order.
        </p>
      </div>
    </div>
  );
}
