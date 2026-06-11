import Image from 'next/image';
import Link from 'next/link';
import { api, type Category, type MenuItem as ApiMenuItem } from '@/lib/api';
import { branding, isExternal } from '@/lib/branding';
import { t } from '@/lib/strings';
import { HeaderNav, type NavItem } from './HeaderNav';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

function fallbackNav(categories: Category[]): NavItem[] {
  const bySlug = (slug: string) => categories.find((c) => c.slug === slug);

  return [
    {
      label: t.latestNews,
      href: '/search?q=latest',
      icon: '📰',
      children: [
        { label: 'Top Stories', href: '/', group: 'Editorial', description: 'Homepage lead package and editor picks.' },
        { label: 'Breaking News', href: '/search?q=breaking', group: 'Editorial', description: 'Fastest developing stories.' },
        { label: 'Trending Now', href: '/search?q=trending', group: 'Newsroom', description: 'Most-read stories across every sport.' },
        { label: 'Transfer Rumors', href: '/search?q=rumors', group: 'Newsroom', description: 'Rumors, chatter and movement watch.' },
        { label: 'Analysis', href: '/search?q=analysis', group: 'Features', description: 'Deep dives and tactical reads.' },
      ],
    },
    {
      label: 'Live Scores',
      href: '/schedule',
      icon: '📊',
      children: [
        { label: 'All Fixtures', href: '/schedule', group: 'Scores', description: 'Daily match list across all sports.' },
        { label: 'Standings', href: '/standings', group: 'Scores', description: 'Tables and qualification picture.' },
        { label: 'Cricket Scores', href: '/category/cricket', group: 'Sports', description: 'Live scorecards and cricket matches.' },
        { label: 'Football Scores', href: '/category/football', group: 'Sports', description: 'Football fixtures and results.' },
      ],
    },
    ...['cricket', 'football', 'nba', 'nfl']
      .map((slug) => bySlug(slug))
      .filter((c): c is Category => Boolean(c))
      .map((c) => ({
        label: c.name,
        href: `/category/${c.slug}`,
        icon: c.icon ?? undefined,
        children: [
          { label: `All ${c.name}`, href: `/category/${c.slug}`, group: 'Coverage', description: `All ${c.name.toLowerCase()} stories.` },
          { label: 'Fixtures & Results', href: '/schedule', group: 'Coverage', description: 'Schedules, live trackers and scores.' },
          ...(c.slug === 'cricket'
            ? [{ label: 'Player Stats', href: '/players', group: 'Resources', description: 'Player search and profiles.' }]
            : []),
          ...((c.children ?? []).slice(0, 4).map((child) => ({
            label: child.name,
            href: `/category/${child.slug}`,
            group: 'Subcategories',
            description: `${child.name} coverage.`,
          }))),
        ],
      })),
  ];
}

function mapMenuItems(menuItems: ApiMenuItem[]): NavItem[] {
  return menuItems
    .filter((item) => item.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      label: item.title,
      href: item.href || '#',
      badge: (item.badge === 'NEW' ? 'NEW' : undefined) as 'NEW' | undefined,
      icon: item.icon ?? undefined,
      description: item.description ?? undefined,
      children: (item.children ?? [])
        .filter((child) => child.isVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((child) => ({
          label: child.title,
          href: child.href || '#',
          badge: (child.badge === 'NEW' ? 'NEW' : undefined) as 'NEW' | undefined,
          icon: child.icon ?? undefined,
          description: child.description ?? undefined,
          group: child.groupName ?? undefined,
        })),
    }));
}

export async function Header() {
  let categories: Awaited<ReturnType<typeof api.getCategories>> = [];
  let menus: Awaited<ReturnType<typeof api.getMenus>> = [];
  try {
    [categories, menus] = await Promise.all([
      api.getCategories(),
      api.getMenus().catch(() => []),
    ]);
  } catch {
    categories = [];
    menus = [];
  }
  const navItems = menus.length > 0 ? mapMenuItems(menus) : fallbackNav(categories);

  return (
    <header className="sticky top-0 z-50 bg-[var(--sn-header-bg)] border-b border-[var(--sn-header-border)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-3 sm:px-5">

        {/* Hamburger (mobile only) */}
        <MobileNav navItems={navItems} />

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${branding.siteName} home`}>
          <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
            <Image
              src={branding.logoPrimary}
              alt={`${branding.siteName} logo`}
              width={624}
              height={425}
              priority
              unoptimized={isExternal(branding.logoPrimary)}
              className="w-auto object-contain"
              style={{ height: '2.75rem', width: 'auto' }}
            />
          </span>
        </Link>

        {/* Desktop nav */}
        <HeaderNav items={navItems} />

        {/* Right controls */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SearchBar />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link
            href="/schedule"
            className="hidden rounded-full border border-[var(--sn-accent)] px-3 py-1 text-xs font-bold text-[var(--sn-accent)] transition hover:bg-[var(--sn-accent)] hover:text-white sm:block"
          >
            {t.live}
          </Link>
        </div>
      </div>
    </header>
  );
}
