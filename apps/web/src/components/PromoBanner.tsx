import Image from 'next/image';
import { fetchSportNews } from '@/lib/espn';

const PROMOS = [
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

export async function PromoBanner() {
  const [nflNews, nbaNews] = await Promise.all([
    fetchSportNews(PROMOS[0].sportPath, PROMOS[0].sportLabel, PROMOS[0].sportSlug, 1),
    fetchSportNews(PROMOS[1].sportPath, PROMOS[1].sportLabel, PROMOS[1].sportSlug, 1),
  ]);

  const newsItems = [nflNews[0], nbaNews[0]];

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {PROMOS.map((promo, i) => {
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
