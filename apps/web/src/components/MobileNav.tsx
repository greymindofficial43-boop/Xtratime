'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavItem } from './HeaderNav';
import { ThemeToggle } from './ThemeToggle';

type Props = {
  navItems: NavItem[];
};

export function MobileNav({ navItems }: Props) {
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
                Xtra<span className="sn-logo-accent"> Time</span>
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
                Main Menu
              </p>
              {navItems.map((item) => {
                const href = item.href;
                const active = pathname === href;
                return (
                  <div key={item.label} className="mb-2 rounded-lg border border-[#2b2d31] bg-[#202124]/80">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-[#2a2a2b] text-[var(--sk-accent)]'
                          : 'text-[#c8c8c8] hover:bg-[#2a2a2b] hover:text-white'
                      }`}
                    >
                      {item.icon ? `${item.icon} ` : ''}{item.label}
                    </Link>
                    {(item.children?.length ?? 0) > 0 && (
                      <div className="border-t border-[#2b2d31] px-2 py-2">
                        {item.children!.map((child) => (
                          <Link
                            key={`${item.label}-${child.label}`}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-[#a8acb7] transition hover:bg-[#2a2a2b] hover:text-white"
                          >
                            {child.icon ? `${child.icon} ` : ''}{child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
