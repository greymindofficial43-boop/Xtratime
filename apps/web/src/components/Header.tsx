import Link from 'next/link';
import { api, type Category, type MenuItem as ApiMenuItem } from '@/lib/api';
import { HeaderNav, type NavItem } from './HeaderNav';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

function fallbackNav(categories: Category[]): NavItem[] {
  const bySlug = (slug: string) => categories.find((category) => category.slug === slug);

  return [
    {
      label: 'Latest News',
      href: '/search?q=latest',
      icon: '📰',
      children: [
        { label: 'Top Stories', href: '/', group: 'Editorial', description: 'Homepage lead package and editor picks.' },
        { label: 'Breaking News', href: '/search?q=breaking', group: 'Editorial', description: 'Fastest developing stories and urgent updates.' },
        { label: 'Trending Now', href: '/search?q=trending', group: 'Newsroom', description: 'Most-read stories across every sport.' },
        { label: 'Transfer Rumors', href: '/search?q=rumors', group: 'Newsroom', description: 'Rumors, insider chatter and movement watch.' },
        { label: 'Analysis', href: '/search?q=analysis', group: 'Features', description: 'Deep dives, explainers and tactical reads.' },
      ],
    },
    {
      label: 'Live Scores',
      href: '/schedule',
      icon: '📊',
      children: [
        { label: 'All Fixtures', href: '/schedule', group: 'Scores', description: 'Daily match list across all tracked sports.' },
        { label: 'Standings', href: '/standings', group: 'Scores', description: 'Tables, records and qualification picture.' },
      ],
    },
    ...['cricket', 'football', 'nba', 'nfl']
      .map((slug) => bySlug(slug))
      .filter((category): category is Category => Boolean(category))
      .map((category) => ({
        label: category.name,
        href: `/category/${category.slug}`,
        icon: category.icon ?? undefined,
        children: [
          { label: `All ${category.name}`, href: `/category/${category.slug}`, group: 'Coverage', description: `All stories from the ${category.name.toLowerCase()} desk.` },
          { label: 'Fixtures & Results', href: '/schedule', group: 'Coverage', description: 'Schedules, live trackers and final scores.' },
          ...(category.slug === 'cricket'
            ? [{ label: 'Player Stats', href: '/players', group: 'Resources', description: 'Player search, batting and bowling profiles.' }]
            : []),
          ...((category.children ?? []).slice(0, 4).map((child) => ({
            label: child.name,
            href: `/category/${child.slug}`,
            group: 'Subcategories',
            description: `Go straight to ${child.name.toLowerCase()} coverage.`,
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
      badge: (item.badge === 'NEW' ? 'NEW' : undefined) as "NEW" | undefined,
      icon: item.icon ?? undefined,
      description: item.description ?? undefined,
      children: (item.children ?? [])
        .filter((child) => child.isVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((child) => ({
          label: child.title,
          href: child.href || '#',
          badge: (child.badge === 'NEW' ? 'NEW' : undefined) as "NEW" | undefined,
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
      {/* Top bar */}
      <div className="mx-auto flex h-[52px] max-w-[1440px] items-center gap-3 px-3 sm:px-5">

        {/* Left: Hamburger (always visible) + Logo */}
        <MobileNav navItems={navItems} />

        {/* Logo */}
        <Link href="/" className="sn-logo shrink-0" aria-label="Xtra Time home">
          Xtra<span className="sn-logo-accent"> Time</span>
        </Link>

        {/* Desktop category nav */}
        <HeaderNav items={navItems} />

        {/* Right: Search, Theme, Live Scores, Login */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SearchBar />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link
            href="/schedule"
            className="hidden rounded-full border border-[var(--sn-accent)] px-3 py-1 text-xs font-bold text-[var(--sn-accent)] transition hover:bg-[var(--sn-accent)] hover:text-white sm:block"
          >
            Live Scores
          </Link>
        </div>
      </div>
    </header>
  );
}
