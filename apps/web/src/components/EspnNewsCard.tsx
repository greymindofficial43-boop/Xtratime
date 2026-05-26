import Image from 'next/image';
import type { EspnNewsItem } from '@/lib/espn';
import { formatRelativeTime } from '@/lib/format';

const FALLBACK = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800';

type Props = {
  news: EspnNewsItem;
  size?: 'default' | 'hero' | 'compact';
};

export function EspnNewsCard({ news, size = 'default' }: Props) {
  if (size === 'compact') {
    return (
      <a
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3 border-b border-[var(--sk-border)] py-3 last:border-0"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={news.imageUrl ?? FALLBACK}
            alt={news.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
            {news.title}
          </p>
          <p className="mt-1 text-xs">
            <span className="font-semibold text-[var(--sk-category)]">{news.sport}</span>
            {news.publishedAt && (
              <>
                <span className="mx-1 text-[var(--sk-muted)]">·</span>
                <span className="text-[var(--sk-muted)]">{formatRelativeTime(news.publishedAt)}</span>
              </>
            )}
          </p>
        </div>
      </a>
    );
  }

  if (size === 'hero') {
    return (
      <a
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl"
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={news.imageUrl ?? FALLBACK}
            alt={news.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <span className="absolute left-3 top-3 sk-cat-badge">{news.sport}</span>
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/80">
            ESPN
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <h2 className="text-lg font-bold leading-snug text-white group-hover:text-[var(--sk-accent)] md:text-xl lg:text-2xl">
            {news.title}
          </h2>
          {news.publishedAt && (
            <p className="mt-1.5 text-xs text-white/70">{formatRelativeTime(news.publishedAt)}</p>
          )}
        </div>
      </a>
    );
  }

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src={news.imageUrl ?? FALLBACK}
          alt={news.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 sk-cat-badge">{news.sport}</span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/80">
          ESPN
        </span>
      </div>
      <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
        {news.title}
      </h3>
      {news.description && (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--sk-muted)]">{news.description}</p>
      )}
      <p className="mt-1 text-xs">
        <span className="font-semibold text-[var(--sk-category)]">{news.sport}</span>
        {news.publishedAt && (
          <>
            <span className="mx-1 text-[var(--sk-muted)]">·</span>
            <span className="text-[var(--sk-muted)]">{formatRelativeTime(news.publishedAt)}</span>
          </>
        )}
      </p>
    </a>
  );
}
