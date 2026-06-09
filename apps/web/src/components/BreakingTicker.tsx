import Link from 'next/link';
import { api } from '@/lib/api';

export async function BreakingTicker() {
  const latest = await api.getArticles({ limit: 10 }).catch(() => ({ items: [] }));
  if (!latest.items.length) return null;

  const headlines = latest.items.map((a) => ({
    title: a.title,
    slug: a.slug,
    categorySlug: a.category.slug,
  }));

  return (
    <div className="sk-ticker-wrap flex h-[34px] items-stretch overflow-hidden border-b border-[var(--sk-header-border)] bg-[var(--sk-header-bg)]">
      <div className="flex shrink-0 items-center gap-1.5 bg-[var(--sk-accent)] px-3">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white opacity-90" />
        <span className="text-[11px] font-black uppercase tracking-widest text-white">Latest</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="sk-ticker-inner">
          {[...headlines, ...headlines].map((h, i) => (
            <span key={i} className="inline-flex items-center">
              <Link
                href={`/${h.categorySlug}/${h.slug}`}
                className="inline-block whitespace-nowrap px-5 text-[13px] font-medium text-[var(--sk-header-nav)] transition-colors hover:text-white"
              >
                {h.title}
              </Link>
              <span className="text-[10px] text-[var(--sk-accent)]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
