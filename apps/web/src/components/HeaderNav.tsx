'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  label: string;
  href: string;
  badge?: 'NEW';
};

export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 flex-1 items-center gap-5 overflow-x-auto lg:flex sk-scrollbar-hide">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`sk-nav-link relative shrink-0 whitespace-nowrap ${
              active ? 'is-active' : ''
            }`}
          >
            {item.label}
            {item.badge && <span className="sk-nav-badge">{item.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
