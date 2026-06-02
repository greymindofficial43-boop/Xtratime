import Link from 'next/link';
import { api } from '@/lib/api';
import { HeaderNav, type NavItem } from './HeaderNav';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

export async function Header() {
  let categories: Awaited<ReturnType<typeof api.getCategories>> = [];
  try {
    categories = await api.getCategories();
  } catch {
    categories = [];
  }

  // Build nav from top-level categories where showInNav === true, sorted by navOrder
  const navCategories = categories
    .filter((c) => c.showInNav && !c.parentId)
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99));

  // Fallback: if no nav categories configured yet, show a default set
  const fallbackSlugs = ['cricket', 'football', 'nba', 'nfl', 'gaming', 'wwe'];
  const navItems: NavItem[] =
    navCategories.length > 0
      ? navCategories.map((c) => ({
          label: c.name,
          href: `/category/${c.slug}`,
          // Only include sub-categories that are enabled in the mega menu (showInNav)
          children: (c.children ?? [])
            .filter((child) => child.showInNav)
            .map((child) => ({ label: child.name, href: `/category/${child.slug}` })),
        }))
      : fallbackSlugs
          .map((slug) => categories.find((c) => c.slug === slug && !c.parentId))
          .filter((c) => c !== undefined)
          .map((c) => ({ label: c!.name, href: `/category/${c!.slug}`, children: [] }));

  // Always show Players link under Cricket
  const cricketNav = navItems.find((item) => item.label.toLowerCase() === 'cricket');
  if (cricketNav) {
    cricketNav.children = [...(cricketNav.children ?? []), { label: 'Player Stats', href: '/players' }];
  }
  return (
    <header className="sticky top-0 z-50 bg-[var(--sn-header-bg)] border-b border-[var(--sn-header-border)]">
      {/* Top bar */}
      <div className="mx-auto flex h-[52px] max-w-[1440px] items-center gap-3 px-3 sm:px-5">

        {/* Left: Hamburger (always visible) + Logo */}
        <MobileNav categories={categories} navItems={navItems} />

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
