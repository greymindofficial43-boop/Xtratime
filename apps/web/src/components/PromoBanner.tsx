import Image from 'next/image';
import { api } from '@/lib/api';
import { fetchSportNews } from '@/lib/espn';

// Default ESPN-powered cards, used only when no promos are configured in the
// admin (Homepage Promos). Keeps the homepage populated out of the box.
const FALLBACK_PROMOS = [
  {
    sportPath: '/football/nfl',
    sportLabel: 'NFL',
    sportSlug: 'nfl',
    fallbackTitle: 'NFL Coverage',
    fallbackSub: 'Breaking news, scores & analysis',
    emoji: '🏈',
    gradient: 'from-blue-950 to-indigo-900',
    href: '/category/nfl',
  },
  {
    sportPath: '/basketball/nba',
    sportLabel: 'NBA',
    sportSlug: 'nba',
    fallbackTitle: 'NBA Coverage',
    fallbackSub: 'Live scores & latest news',
    emoji: '🏀',
    gradient: 'from-orange-950 to-red-900',
    href: '/category/nba',
  },
] as const;

const GRADIENTS = [
  'from-blue-950 to-indigo-900',
  'from-orange-950 to-red-900',
  'from-emerald-950 to-teal-900',
  'from-fuchsia-950 to-purple-900',
];

export async function PromoBanner() {
  // Admin-managed promos take priority; ESPN cards are the fallback.
  const promos = await api.getPromos().catch(() => []);
  const active = promos.filter((p) => p.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  if (active.length > 0) {
    return (
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {active.map((promo, i) => (
          <a
            key={promo.id}
            href={promo.href}
            target={promo.openInNewTab ? '_blank' : undefined}
            rel={promo.openInNewTab ? 'noopener noreferrer' : undefined}
            className={`group relative flex min-h-[130px] items-end overflow-hidden rounded-xl bg-gradient-to-r ${GRADIENTS[i % GRADIENTS.length]} p-5 transition`}
          >
            {promo.imageUrl && (
              <Image
                src={promo.imageUrl}
                alt={promo.title}
                fill
                className="object-cover opacity-30 transition duration-500 group-hover:opacity-40 group-hover:scale-105"
              />
            )}
            <div className="relative z-10 pr-12">
              {promo.label && (
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  {promo.label}
                </span>
              )}
              <p className="mt-1 text-base font-bold leading-snug text-white group-hover:text-[var(--sk-accent)] md:text-lg">
                {promo.title}
              </p>
            </div>
            {promo.emoji && (
              <span className="absolute right-5 top-4 text-3xl opacity-80">{promo.emoji}</span>
            )}
          </a>
        ))}
      </div>
    );
  }

  // ── Fallback: live ESPN headlines for NFL & NBA ──
  const [nflNews, nbaNews] = await Promise.all([
    fetchSportNews(FALLBACK_PROMOS[0].sportPath, FALLBACK_PROMOS[0].sportLabel, FALLBACK_PROMOS[0].sportSlug, 1),
    fetchSportNews(FALLBACK_PROMOS[1].sportPath, FALLBACK_PROMOS[1].sportLabel, FALLBACK_PROMOS[1].sportSlug, 1),
  ]);
  const newsItems = [nflNews[0], nbaNews[0]];

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {FALLBACK_PROMOS.map((promo, i) => {
        const news = newsItems[i];
        const isExternal = !!news;
        return (
          <a
            key={promo.sportSlug}
            href={isExternal ? news.url : promo.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={`group relative flex min-h-[130px] items-end overflow-hidden rounded-xl bg-gradient-to-r ${promo.gradient} p-5 transition`}
          >
            {news?.imageUrl && (
              <Image
                src={news.imageUrl}
                alt={news.title}
                fill
                className="object-cover opacity-25 transition duration-500 group-hover:opacity-35 group-hover:scale-105"
              />
            )}
            <div className="relative z-10 pr-12">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                {isExternal ? 'ESPN · ' : ''}{promo.sportLabel}
              </span>
              <p className="mt-1 text-base font-bold leading-snug text-white group-hover:text-[var(--sk-accent)] md:text-lg">
                {news?.title ?? promo.fallbackTitle}
              </p>
              {!news && (
                <p className="mt-0.5 text-sm text-white/60">{promo.fallbackSub}</p>
              )}
            </div>
            <span className="absolute right-5 top-4 text-3xl opacity-80">{promo.emoji}</span>
          </a>
        );
      })}
    </div>
  );
}
