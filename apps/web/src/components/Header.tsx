import Link from 'next/link';
import { api } from '@/lib/api';
import { HeaderMoreMenu } from './HeaderMoreMenu';
import { HeaderNav, type NavItem } from './HeaderNav';
import { MobileNav } from './MobileNav';

const TOP_NAV: { label: string; slug: string; badge?: 'NEW' }[] = [
  { label: 'Cricket', slug: 'cricket' },
  { label: 'Tech SK', slug: 'gaming', badge: 'NEW' },
  { label: 'Indian Sports', slug: 'indian-sports' },
  { label: 'Football', slug: 'football' },
  { label: 'Tennis', slug: 'tennis' },
  { label: 'Golf', slug: 'golf' },
  { label: 'F1', slug: 'f1' },
];

const TOP_NAV_SLUGS = TOP_NAV.map((n) => n.slug);

export async function Header() {
  let categories: Awaited<ReturnType<typeof api.getCategories>> = [];
  try {
    categories = await api.getCategories();
  } catch {
    categories = [];
  }

  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const navItems: NavItem[] = TOP_NAV.map((item) => {
    const cat = categoryBySlug[item.slug];
    return {
      label: item.label,
      href: cat ? `/category/${cat.slug}` : '/',
      badge: item.badge,
    };
  });

  return (
    <header className="sk-header sticky top-0 z-50">
      <div className="sk-header-bar mx-auto flex h-[49px] max-w-[1440px] items-center gap-3 px-3 sm:px-4">
        <MobileNav categories={categories} navItems={navItems} />

        <Link href="/" className="sk-header-logo shrink-0" aria-label="Sportskeeda home">
          sportskeeda
        </Link>

        <HeaderNav items={navItems} />

        <div className="ml-auto flex shrink-0 items-center">
          <HeaderMoreMenu categories={categories} topNavSlugs={TOP_NAV_SLUGS} />
        </div>
      </div>
    </header>
  );
}
