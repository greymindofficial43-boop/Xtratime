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
          <div key={item.label} className="relative flex h-full items-center">
            <Link
              href={item.href}
              className={`sk-nav-link relative shrink-0 whitespace-nowrap py-[14px] ${
                active ? 'text-[var(--sn-accent)]' : 'hover:text-white'
              }`}
            >
              {item.label}
              {item.badge && <span className="sk-nav-badge">{item.badge}</span>}
            </Link>
            {active && (
              <div
                className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[var(--sn-accent)]"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
