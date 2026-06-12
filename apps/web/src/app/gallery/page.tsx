import Link from 'next/link';
import { api } from '@/lib/api';
import { AdSlot } from '@/components/AdSlot';

export const revalidate = 60;

export const metadata = {
  title: 'ফটো গ্যালারি | XtraTime Bangla',
  description: 'XtraTime Bangla-এর সর্বশেষ ফটো গ্যালারি।',
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const { items: galleries, total, totalPages } = await api
    .getArticles({ type: 'GALLERY', limit: 18, page })
    .catch(() => ({ items: [], total: 0, page: 1, totalPages: 0, limit: 18 }));

  return (
    <div className="mx-auto max-w-[1200px] px-3 sm:px-5 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sk-accent)] text-white text-lg">
          🖼️
        </div>
        <h1 className="text-2xl font-extrabold">ফটো গ্যালারি</h1>
      </div>

      <AdSlot zone="article-top" className="mb-6" />

      {galleries.length === 0 ? (
        <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-14 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-[var(--sk-muted)]">এখনো কোনো গ্যালারি নেই।</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/${gallery.category.slug}/${gallery.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] hover:border-[var(--sk-accent)] transition"
              >
                {/* Cover image — first gallery image or featuredImage */}
                <div className="relative aspect-video overflow-hidden bg-[var(--sk-surface)]">
                  {gallery.galleryImages?.[0]?.url || gallery.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gallery.galleryImages?.[0]?.url ?? gallery.featuredImage!}
                      alt={gallery.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-[var(--sk-muted)]">
                      🖼️
                    </div>
                  )}

                  {/* Photo count badge */}
                  {gallery.galleryImages && gallery.galleryImages.length > 0 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
                      📷 {gallery.galleryImages.length}
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <span className="text-xs font-semibold text-[var(--sk-accent)]">
                    {gallery.category.name}
                  </span>
                  <h2 className="mt-1 text-sm font-bold line-clamp-2 leading-snug">
                    {gallery.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/gallery?page=${page - 1}`}
                  className="rounded-lg border border-[var(--sk-border)] px-4 py-2 text-sm font-semibold hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)] transition"
                >
                  ← আগের পাতা
                </Link>
              )}
              <span className="text-sm text-[var(--sk-muted)]">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/gallery?page=${page + 1}`}
                  className="rounded-lg border border-[var(--sk-border)] px-4 py-2 text-sm font-semibold hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)] transition"
                >
                  পরের পাতা →
                </Link>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <AdSlot zone="home-bottom" />
      </div>
    </div>
  );
}
