'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavItem } from './HeaderNav';
import { branding, isExternal } from '@/lib/branding';
import { t } from '@/lib/strings';
import { ThemeToggle } from './ThemeToggle';
import { SocialLinks } from './SocialLinks';

type Props = {
  navItems: NavItem[];
};

export function MobileNav({ navItems }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-[5px]" aria-hidden>
          <span className="block h-[2px] w-[18px] rounded-full bg-[var(--sn-header-nav)]" />
          <span className="block h-[2px] w-[18px] rounded-full bg-[var(--sn-header-nav)]" />
          <span className="block h-[2px] w-[18px] rounded-full bg-[var(--sn-header-nav)]" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[150]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* Drawer — slides in from LEFT on mobile */}
          <aside
            className="absolute left-0 top-0 flex h-full flex-col bg-[var(--sn-menu-bg)] shadow-2xl"
            style={{ width: 'min(300px, 88vw)', animation: 'slideInLeft 0.22s ease-out' }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--sn-menu-border)] px-4">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-white px-2 py-1">
                  <Image
                    src={branding.logoPrimary}
                    alt={`${branding.siteName} logo`}
                    width={160}
                    height={48}
                    unoptimized={isExternal(branding.logoPrimary)}
                    className="w-auto object-contain"
                    style={{ height: '2.25rem' }}
                  />
                </span>
                {/* Secondary logo removed from mobile drawer — primary only */}
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-2xl text-[var(--sn-menu-muted)] hover:text-[var(--sn-nav-strong)]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const hasChildren = (item.children?.length ?? 0) > 0;
                const isExpanded = expanded === item.label;

                return (
                  <div key={item.label} className="mb-1">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'bg-[var(--sn-accent-soft)] text-[var(--sn-accent)]'
                            : 'text-[var(--sn-header-nav)] hover:bg-[var(--sn-menu-hover)] hover:text-[var(--sn-nav-strong)]'
                        }`}
                      >
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : item.label)}
                          className="flex h-9 w-9 items-center justify-center text-[var(--sn-menu-muted)] hover:text-[var(--sn-nav-strong)]"
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <path d="M1 1.5 5 5 9 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <div className="ml-3 mt-1 border-l border-[var(--sn-menu-border)] pl-3">
                        {item.children!.map((child) => (
                          <Link
                            key={`${item.label}-${child.label}`}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm text-[var(--sn-header-nav)] transition hover:bg-[var(--sn-menu-hover)] hover:text-[var(--sn-nav-strong)]"
                          >
                            {child.icon && <span className="mr-1.5">{child.icon}</span>}
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Social links (only render when configured) */}
              <div className="mt-3 border-t border-[var(--sn-menu-border)] pt-3">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--sn-menu-muted)]">{t.followUs}</p>
                <div className="px-3">
                  <SocialLinks />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-[var(--sn-menu-border)] px-4 py-3">
              <span className="text-xs text-[var(--sn-menu-muted)]">{t.theme}</span>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
