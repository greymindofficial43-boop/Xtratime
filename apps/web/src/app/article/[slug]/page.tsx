import Image from 'next/image';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { AdSlot } from '@/components/AdSlot';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await api.getArticle(slug).catch(() => null);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: `${article.title} | Sportskeeda`,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await api.getArticle(slug).catch(() => null);
  if (!article) notFound();

  const related = await api
    .getArticles({ category: article.category.slug, limit: 4 })
    .catch(() => ({ items: [] }));

  const relatedFiltered = related.items.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
      {/* ── Main article ── */}
      <article>
        {/* Breadcrumb / meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={`/category/${article.category.slug}`}
            className="sk-cat-badge"
          >
            {article.category.name}
          </Link>
          <span className="text-[var(--sk-muted)]">•</span>
          <span className="text-[var(--sk-muted)]">
            {formatRelativeTime(article.publishedAt)}
          </span>
          {article.isTrending && (
            <span className="rounded-full bg-[var(--sk-accent)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--sk-accent)]">
              🔥 Trending
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black leading-tight text-[var(--sk-text)] md:text-3xl lg:text-4xl">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="mt-3 text-base font-medium text-[var(--sk-muted)] md:text-lg">
            {article.excerpt}
          </p>
        )}

        <p className="mt-4 text-sm text-[var(--sk-muted)]">
          By{' '}
          <span className="font-semibold text-[var(--sk-text)]">{article.author.name}</span>
          <span className="mx-2">·</span>
          {article.viewCount.toLocaleString()} views
        </p>

        {article.featuredImage && (
          <div className="relative mt-5 aspect-video overflow-hidden rounded-xl">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* In-article ad — below image, before content */}
        <div className="my-6 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-3">
          <AdSlot zone="inline" />
        </div>

        <div
          className="prose-article mt-2"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
        />

        {/* In-article ad — after content */}
        <div className="my-8 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-3">
          <AdSlot zone="inline" />
        </div>

        {article.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 border-t border-[var(--sk-border)] pt-6">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-[var(--sk-border)] px-3 py-1 text-xs font-medium text-[var(--sk-muted)] hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)] transition"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {relatedFiltered.length > 0 && (
          <section className="mt-10 border-t border-[var(--sk-border)] pt-8">
            <h2 className="sk-section-heading mb-5 text-base font-black uppercase tracking-wide text-[var(--sk-text)]">
              More in {article.category.name}
            </h2>
            <div className="divide-y divide-[var(--sk-border)] rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
              {relatedFiltered.map((a) => (
                <ArticleCard key={a.id} article={a} size="list" />
              ))}
            </div>
          </section>
        )}
      </article>

      {/* ── Article sidebar ── */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <AdSlot zone="sidebar" />
          </div>
          <div className="rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)] p-4">
            <AdSlot zone="sidebar" />
          </div>
        </div>
      </aside>
    </div>
  );
}
