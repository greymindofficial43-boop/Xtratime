import Image from 'next/image';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
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
    <article className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <Link
          href={`/category/${article.category.slug}`}
          className="font-semibold text-[var(--sk-category)] hover:text-[var(--sk-accent)]"
        >
          {article.category.name}
        </Link>
        <span className="text-[var(--sk-muted)]">•</span>
        <span className="text-[var(--sk-muted)]">
          {formatRelativeTime(article.publishedAt)}
        </span>
        {article.isTrending && (
          <>
            <span className="text-[var(--sk-muted)]">•</span>
            <span className="rounded-full bg-[var(--sk-accent)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--sk-accent)]">
              Trending
            </span>
          </>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-tight text-[var(--sk-text)] md:text-3xl lg:text-4xl">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-3 text-base text-[var(--sk-muted)] md:text-lg">{article.excerpt}</p>
      )}

      <p className="mt-4 text-sm text-[var(--sk-muted)]">
        By <span className="font-medium text-[var(--sk-text)]">{article.author.name}</span>
        <span className="mx-2">·</span>
        {article.viewCount.toLocaleString()} views
      </p>

      {article.featuredImage && (
        <div className="relative mt-5 aspect-video overflow-hidden rounded-lg">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose-article mt-6"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--sk-border)] pt-6">
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-[var(--sk-border)] px-3 py-1 text-xs text-[var(--sk-muted)]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {relatedFiltered.length > 0 && (
        <section className="mt-10 border-t border-[var(--sk-border)] pt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--sk-text)]">
            More in {article.category.name}
            <span className="text-[var(--sk-heading)]">›</span>
          </h2>
          <div className="space-y-0 rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)] px-3">
            {relatedFiltered.map((a) => (
              <ArticleCard key={a.id} article={a} size="list" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
