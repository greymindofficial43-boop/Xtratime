import Image from 'next/image';
import Link from 'next/link';
import { formatDateTime } from '@/lib/format';
import { branding, isExternal } from '@/lib/branding';
import { getYouTubeThumbnail } from '@/lib/youtube';
import type { Article } from '@/lib/api';

type Props = {
  article: Article;
  size?: 'default' | 'grid' | 'hero' | 'list' | 'compact' | 'numbered';
  rank?: number;
};

// Cover image for a card. Uses the featured image, then the YouTube thumbnail,
// then falls back to the site logo (per-locale) on a neutral surface — shown
// object-contain so the logo isn't cropped like a stock photo would be.
function Cover({ article, priority, zoom, compact }: { article: Article; priority?: boolean; zoom?: boolean; compact?: boolean }) {
  const real = article.featuredImage || getYouTubeThumbnail(article.videoUrl);
  const src = real || branding.logoPrimary;
  const isFallback = !real;
  return (
    <Image
      src={src}
      alt={article.title}
      fill
      priority={priority}
      unoptimized={isFallback && isExternal(src)}
      className={
        isFallback
          ? `object-contain bg-[var(--sk-surface-elevated)] ${compact ? 'p-2' : 'p-5'}`
          : `object-cover${zoom ? ' transition duration-300 group-hover:scale-105' : ''}`
      }
    />
  );
}

const PlayIcon = ({ small }: { small?: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition duration-300 z-10 pointer-events-none">
    <div className={`flex items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm group-hover:scale-110 transition duration-300 ${small ? 'h-8 w-8' : 'h-12 w-12'}`}>
      <svg width={small ? "16" : "24"} height={small ? "16" : "24"} viewBox="0 0 24 24" fill="currentColor" className={`text-[var(--sk-accent)] ${small ? 'ml-0.5' : 'ml-1'}`}>
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>
);

function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="mt-1.5 text-xs">
      <span className="font-semibold text-[var(--sk-category)]">{article.category.name}</span>
      <span className="mx-1.5 text-[var(--sk-muted)]">•</span>
      <span className="text-[var(--sk-muted)]">{formatDateTime(article.publishedAt ?? article.createdAt)}</span>
    </p>
  );
}

export function ArticleCard({ article, size = 'default', rank }: Props) {
  const href = `/${article.category.slug}/${article.slug}`;
  const hasVideo = !!article.videoUrl;

  if (size === 'grid') {
    return (
      <Link href={href} className="group block min-w-[240px] flex-1 sm:min-w-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Cover article={article} zoom />
          {hasVideo && <PlayIcon />}
          <span className="absolute left-2.5 top-2.5 sk-cat-badge">
            {article.category.name}
          </span>
        </div>
        <h3 className="mt-2.5 line-clamp-3 text-sm font-bold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--sk-muted)]">
          {formatDateTime(article.publishedAt ?? article.createdAt)}
        </p>
      </Link>
    );
  }

  if (size === 'hero') {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-xl">
        <div className="relative aspect-[16/10] w-full">
          <Cover article={article} priority zoom />
          {hasVideo && <PlayIcon />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10 pointer-events-none" />
          <span className="absolute left-3 top-3 sk-cat-badge">{article.category.name}</span>
          {article.isTrending && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--sk-accent)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              🔥 Trending
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] group-hover:text-[var(--sk-accent)] md:text-lg">
            {article.title}
          </h2>
          <p className="mt-1.5 text-xs text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {formatDateTime(article.publishedAt ?? article.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (size === 'list') {
    return (
      <Link
        href={href}
        className="group flex gap-3 py-3 last:pb-0 border-b border-[var(--sk-border)] last:border-0"
      >
        <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-lg">
          <Cover article={article} compact />
          {hasVideo && <PlayIcon small />}
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
      <Link href={href} className="group flex items-start gap-2.5 py-2.5 border-b border-[var(--sk-border)] last:border-0">
        <span className="sk-rank-num">{rank}</span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm font-semibold leading-snug text-[var(--sk-text)] group-hover:text-[var(--sk-accent)]">
            {article.title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--sk-muted)]">
            {formatDateTime(article.publishedAt ?? article.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (size === 'compact') {
    return (
      <Link
        href={href}
        className="group flex gap-3 border-b border-[var(--sk-border)] py-3 last:border-0"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
          <Cover article={article} compact />
          {hasVideo && <PlayIcon small />}
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
      className="group sk-card-lift block overflow-hidden rounded-xl border border-[var(--sk-border)] bg-[var(--sk-surface)]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Cover article={article} zoom />
        {hasVideo && <PlayIcon />}
        <span className="absolute left-2.5 top-2.5 sk-cat-badge">{article.category.name}</span>
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
