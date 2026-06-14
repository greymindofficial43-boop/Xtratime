'use client';

import { adminApi, type Article } from '@/lib/api';
import { site } from '@/lib/site';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  PUBLISHED: { bg: 'rgba(22,163,74,0.12)', text: '#16a34a', label: 'Published' },
  DRAFT:     { bg: 'rgba(217,119,6,0.12)',  text: '#d97706', label: 'Draft' },
  ARCHIVED:  { bg: 'rgba(107,114,128,0.12)',text: '#6b7280', label: 'Archived' },
};

export default function GalleryAdminPage() {
  const [galleries, setGalleries] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getArticles({ type: 'GALLERY', limit: '50', allStatuses: 'true' });
      setGalleries(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Move "${title}" to Trash?`)) return;
    try {
      await adminApi.deleteArticle(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const published = galleries.filter((g) => g.status === 'PUBLISHED').length;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Photo Galleries</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
            {galleries.length} total · {published} published
          </p>
        </div>
        <Link
          href="/articles/new?type=GALLERY"
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--admin-accent)' }}
        >
          + New Gallery
        </Link>
      </div>

      {loading ? (
        <div
          className="rounded-xl border p-12 text-center text-sm"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
        >
          Loading galleries…
        </div>
      ) : galleries.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          <p className="mb-3 text-4xl">🖼️</p>
          <p className="mb-4 text-sm" style={{ color: 'var(--admin-muted)' }}>No galleries yet.</p>
          <Link
            href="/articles/new"
            className="inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--admin-accent)' }}
          >
            Create your first gallery
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 sm:hidden">
            {galleries.map((gallery) => {
              const s = statusStyles[gallery.status] ?? statusStyles.DRAFT;
              const count = gallery.galleryImages?.length ?? 0;
              return (
                <div
                  key={gallery.id}
                  className="rounded-xl border px-4 py-3"
                  style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="mb-2 flex items-start gap-3">
                    {gallery.featuredImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={gallery.featuredImage} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                    )}
                    <p className="flex-1 text-sm font-semibold leading-snug" style={{ color: 'var(--admin-text)' }}>
                      {gallery.title}
                    </p>
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                    <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ background: `${gallery.category.color ?? '#e10600'}22`, color: gallery.category.color ?? '#e10600' }}>{gallery.category.name}</span>
                    {count > 0 && <span style={{ color: 'var(--admin-muted)' }}>{count} photos</span>}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a href={`${site.webUrl}/${gallery.category.slug}/${gallery.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>View</a>
                    <Link href={`/articles/${gallery.id}/edit`} className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>Edit</Link>
                    <button onClick={() => handleDelete(gallery.id, gallery.title)} className="text-sm font-medium text-red-500">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div
            className="hidden overflow-x-auto rounded-xl border sm:block"
            style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
          >
            <table className="w-full text-left text-sm">
              <thead className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Cover</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Title</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Category</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Photos</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Status</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Date</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleries.map((gallery) => {
                  const s = statusStyles[gallery.status] ?? statusStyles.DRAFT;
                  const count = gallery.galleryImages?.length ?? 0;
                  return (
                    <tr key={gallery.id} className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                      <td className="px-5 py-3">
                        {gallery.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={gallery.featuredImage} alt="" className="h-12 w-16 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg text-2xl" style={{ background: 'var(--admin-bg)' }}>🖼️</div>
                        )}
                      </td>
                      <td className="px-5 py-3" style={{ maxWidth: 260 }}>
                        <p className="line-clamp-2 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{gallery.title}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: `${gallery.category.color ?? '#e10600'}22`, color: gallery.category.color ?? '#e10600' }}
                        >
                          {gallery.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: 'var(--admin-muted)' }}>
                        {count > 0 ? `${count} photos` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.text }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--admin-muted)' }}>
                        {(gallery.publishedAt ?? gallery.createdAt)
                          ? new Date((gallery.publishedAt ?? gallery.createdAt) as string).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          <a href={`${site.webUrl}/${gallery.category.slug}/${gallery.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition hover:opacity-70" style={{ color: 'var(--admin-accent-2)' }}>View</a>
                          <Link href={`/articles/${gallery.id}/edit`} className="text-sm font-medium transition hover:opacity-70" style={{ color: 'var(--admin-accent-2)' }}>Edit</Link>
                          <button onClick={() => handleDelete(gallery.id, gallery.title)} className="text-sm font-medium text-red-500 transition hover:text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
