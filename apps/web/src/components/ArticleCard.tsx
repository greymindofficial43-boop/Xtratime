import Image from 'next/image';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/format';
import type { Article } from '@/lib/api';

type Props = {
  article: Article;
  size?: 'default' | 'grid' | 'hero' | 'list' | 'compact' | 'numbered';
  rank?: number;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800';

function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="mt-1.5 text-xs">
      <span className="font-semibold text-[var(--sk-category)]">{article.category.name}</span>
      <span className="mx-1.5 text-[var(--sk-muted)]">•</span>
      <span className="text-[var(--sk-muted)]">{formatRelativeTime(article.publishedAt)}</span>
    </p>
  );
}

export function ArticleCard({ article, size = 'default', rank }: Props) {
  const href = `/article/${article.slug}`;
  const image = article.featuredImage ?? FALLBACK_IMAGE;

  if (size === 'grid') {
    return (
      <Link href={href} className="group block min-w-[240px] flex-1 sm:min-w-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={article.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
          {article.title}
        </h3>
        <ArticleMeta article={article} />
      </Link>
    );
  }

  if (size === 'hero') {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-lg">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={article.featuredImage ?? `${FALLBACK_IMAGE}&w=1200`}
            alt={article.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <h2 className="text-lg font-bold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)] md:text-xl">
            {article.title}
          </h2>
          <ArticleMeta article={article} />
        </div>
      </Link>
    );
  }

  if (size === 'list') {
    return (
      <Link href={href} className="group flex gap-3 border-b border-[var(--sk-border)] py-3 last:border-0">
        <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-md">
          <Image src={image} alt="" fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm font-semibold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
            {article.title}
          </p>
          <ArticleMeta article={article} />
        </div>
      </Link>
    );
  }

  if (size === 'numbered' && rank !== undefined) {
    return (
      <Link href={href} className="group flex gap-3 py-2.5">
        <span className="w-6 shrink-0 text-2xl font-black leading-none text-[var(--sk-category)]">
          {rank}
        </span>
        <p className="line-clamp-3 text-sm font-medium leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)] group-hover:underline">
          {article.title}
        </p>
      </Link>
    );
  }

  if (size === 'compact') {
    return (
      <Link href={href} className="group flex gap-3 border-b border-[var(--sk-border)] py-3 last:border-0">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
          <Image src={image} alt="" fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold group-hover:text-[var(--sk-accent)]">
            {article.title}
          </p>
          <ArticleMeta article={article} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-[var(--sk-border)] bg-[var(--sk-surface)]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={image}
          alt={article.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-bold leading-snug group-hover:text-[var(--sk-accent)]">
          {article.title}
        </h3>
        <ArticleMeta article={article} />
      </div>
    </Link>
  );
}
