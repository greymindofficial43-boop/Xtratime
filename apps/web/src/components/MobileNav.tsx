'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/api';
import { site } from '@/lib/site';
import type { NavItem } from './HeaderNav';
import { ThemeToggle } from './ThemeToggle';

type Props = {
  categories: Category[];
  navItems: NavItem[];
};

export function MobileNav({ categories, navItems }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger — always visible, top-left */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sk-hamburger flex h-9 w-9 shrink-0 items-center justify-center"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-[5px]" aria-hidden>
          <span className="block h-[2px] w-[18px] rounded-full bg-[#c8c8c8]" />
          <span className="block h-[2px] w-[18px] rounded-full bg-[#c8c8c8]" />
          <span className="block h-[2px] w-[18px] rounded-full bg-[#c8c8c8]" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/75"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />

          {/* Drawer */}
          <aside className="sk-sidebar relative flex h-full w-[min(300px,88vw)] flex-col bg-[#1c1c1d] shadow-2xl">
            <div className="flex h-[49px] items-center justify-between border-b border-[#333] px-4">
              <Link href="/" onClick={() => setOpen(false)} className="sn-logo text-xl">
                sporty<span className="sn-logo-accent">newz</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-2xl text-[#808080] hover:text-white"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#666]">
                All Categories
              </p>
              {categories.map((cat) => {
                const href = `/category/${cat.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-[#2a2a2b] text-[var(--sk-accent)]'
                        : 'text-[#c8c8c8] hover:bg-[#2a2a2b] hover:text-white'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </Link>
                );
              })}

              <div className="mt-4 border-t border-[#333] pt-3">
                <Link
                  href="/schedule"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm text-[#c8c8c8] hover:bg-[#2a2a2b] hover:text-white"
                >
                  🔴 Live Scores
                </Link>
                <Link
                  href={site.adminUrl}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-[var(--sk-accent)]"
                >
                  Log in
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#333] px-4 py-3">
              <span className="text-xs text-[#808080]">Theme</span>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
