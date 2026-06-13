import Link from 'next/link';
import { api } from '@/lib/api';
import { AdSlot } from '@/components/AdSlot';
import { t } from '@/lib/strings';

export const revalidate = 60;

export const metadata = {
  title: t.galleryMetaTitle,
  description: t.galleryMetaDescription,
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const { items: galleries, totalPages } = await api
    .getArticles({ type: 'GALLERY', limit: 19, page })
    .catch(() => ({ items: [], total: 0, page: 1, totalPages: 0, limit: 19 }));

  const hero = page === 1 ? galleries[0] : null;
  const rest = page === 1 ? galleries.slice(1) : galleries;

  function GalleryCard({
    gallery,
    large = false,
  }: {
    gallery: (typeof galleries)[0];
    large?: boolean;
  }) {
    const coverUrl =
      gallery.galleryImages?.[0]?.url ?? gallery.featuredImage ?? null;
    const count = gallery.galleryImages?.length ?? 0;

    return (
      <Link
        href={`/${gallery.category.slug}/${gallery.slug}`}
        className={`group relative block overflow-hidden bg-black ${large ? 'rounded-2xl' : 'rounded-xl'}`}
      >
        {/* Image */}
        <div
          className={`relative w-full overflow-hidden ${large ? 'aspect-[16/9] sm:aspect-[21/9]' : 'aspect-[4/3]'}`}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={gallery.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-5xl">
              🖼️
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Category pill — top left */}
          <span className="absolute left-3 top-3 rounded-full bg-[var(--sk-accent)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
            {gallery.category.name}
          </span>

          {/* Photo count — top right */}
          {count > 0 && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white opacity-80">
                <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zm0 1.8a5 5 0 1 1 0-10 5 5 0 0 1 0 10zM9 3l-1.83 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9z" />
              </svg>
              {count}
            </span>
          )}

          {/* Title — bottom overlay */}
          <div className={`absolute bottom-0 left-0 right-0 ${large ? 'p-5 sm:p-7' : 'p-3.5'}`}>
            <h2
              className={`font-extrabold leading-snug text-white drop-shadow ${large ? 'text-xl sm:text-3xl' : 'text-sm sm:text-base line-clamp-2'}`}
            >
              {gallery.title}
            </h2>
            {large && gallery.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-sm text-white/70">
                {gallery.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Caption strip below image */}
        {gallery.galleryImages?.[0]?.caption && (
          <div className="border-t border-white/10 bg-neutral-900 px-3.5 py-2">
            <p className="line-clamp-1 text-xs text-neutral-400">
              {gallery.galleryImages[0].caption}
            </p>
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-8 sm:px-5">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">📷</span>
        <h1 className="text-2xl font-extrabold">{t.galleryPageTitle}</h1>
      </div>

      <AdSlot zone="article-top" className="mb-6" />

      {galleries.length === 0 ? (
        <div className="rounded-2xl bg-neutral-900 p-16 text-center">
          <p className="mb-3 text-4xl">🖼️</p>
          <p className="text-neutral-400">{t.galleryEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hero && <GalleryCard gallery={hero} large />}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {rest.map((gallery) => (
                <GalleryCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/gallery?page=${page - 1}`}
              className="rounded-full border border-[var(--sk-border)] px-5 py-2 text-sm font-semibold transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
            >
              {t.galleryPrevPage}
            </Link>
          )}
          <span className="text-sm text-[var(--sk-muted)]">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/gallery?page=${page + 1}`}
              className="rounded-full border border-[var(--sk-border)] px-5 py-2 text-sm font-semibold transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
            >
              {t.galleryNextPage}
            </Link>
          )}
        </div>
      )}

      <div className="mt-8">
        <AdSlot zone="home-bottom" />
      </div>
    </div>
  );
}
