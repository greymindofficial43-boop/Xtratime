'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SubHeader() {
  const pathname = usePathname();

  // Only render on category pages
  if (!pathname.startsWith('/category/')) return null;

  const slug = pathname.split('/').pop() ?? '';
  const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  // Define fallback tabs based on the slug (like Sportskeeda)
  let tabs = [
    { label: formattedSlug, href: `/category/${slug}` },
    { label: 'Newsletters', href: `/category/${slug}` },
    { label: 'Schedule', href: `/category/${slug}` },
    { label: 'Standings', href: `/category/${slug}` },
    { label: 'Videos', href: `/category/${slug}` },
  ];

  if (slug === 'football') {
    tabs = [
      { label: 'Football', href: `/category/football` },
      { label: 'Newsletters', href: `/category/football` },
      { label: 'Schedule', href: `/schedule` },
      { label: '2026 FIFA World Cup', href: `/category/football` },
      { label: 'EURO', href: `/category/football` },
      { label: 'Copa America', href: `/category/football` },
      { label: 'EPL', href: `/category/football` },
      { label: 'Champions League', href: `/category/football` },
      { label: 'La Liga', href: `/category/football` },
    ];
  } else if (slug === 'cricket') {
    tabs = [
      { label: 'Cricket', href: `/category/cricket` },
      { label: 'Schedule', href: `/schedule` },
      { label: 'Videos', href: `/category/cricket` },
      { label: 'IPL 2026', href: `/category/cricket` },
      { label: 'NZ-W vs ENG-W', href: `/category/cricket` },
      { label: 'AUS vs PAK', href: `/category/cricket` },
    ];
  }

  return (
    <div className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-3 py-0 sm:px-5 sk-scrollbar-hide">
        {tabs.map((tab, idx) => {
          // The first tab (category name) is always active in this view based on screenshots
          const isActive = idx === 0;

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`relative whitespace-nowrap py-3 text-sm font-semibold transition-colors ${
                isActive ? 'text-[#d62828]' : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d62828]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
