import Link from 'next/link';
import { api } from '@/lib/api';
import { HeaderMoreMenu } from './HeaderMoreMenu';
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

  // Build nav from categories where showInNav === true, sorted by navOrder
  const navCategories = categories
    .filter((c) => c.showInNav)
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99));

  // Fallback: if no nav categories configured yet, show a default set
  const fallbackSlugs = ['cricket', 'football', 'nba', 'nfl', 'gaming', 'wwe'];
  const navItems: NavItem[] =
    navCategories.length > 0
      ? navCategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` }))
      : fallbackSlugs
          .map((slug) => categories.find((c) => c.slug === slug))
          .filter(Boolean)
          .map((c) => ({ label: c!.name, href: `/category/${c!.slug}` }));

  const topNavSlugs = navItems.map((n) => n.href.split('/').pop() ?? '');

  return (
    <header className="sticky top-0 z-50 bg-[var(--sn-header-bg)] border-b border-[var(--sn-header-border)]">
      {/* Top bar */}
      <div className="mx-auto flex h-[52px] max-w-[1440px] items-center gap-3 px-3 sm:px-5">
        <MobileNav categories={categories} navItems={navItems} />

        {/* Logo */}
        <Link href="/" className="sn-logo shrink-0" aria-label="SportyNewz home">
          sporty<span className="sn-logo-accent">newz</span>
        </Link>

        <HeaderNav items={navItems} />

        <div className="ml-auto flex shrink-0 items-center gap-3">
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
          <HeaderMoreMenu categories={categories} topNavSlugs={topNavSlugs} />
        </div>
      </div>
    </header>
  );
}
