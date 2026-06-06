'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { site } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';

const NAV_SECTIONS = [
  {
    label: 'Content',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '▦' },
      { href: '/articles', label: 'Articles', icon: '✎' },
      { href: '/categories', label: 'Categories', icon: '⊞' },
      { href: '/tags', label: 'Tags', icon: '◈' },
    ],
  },
  {
    label: 'Scores & Media',
    items: [
      { href: '/matches', label: 'Matches', icon: '⚽' },
    ],
  },
  {
    label: 'Navigation',
    items: [
      { href: '/navigation', label: 'Menus', icon: '☰' },
    ],
  },
  {
    label: 'Monetisation',
    items: [
      { href: '/ads', label: 'Ad Slots', icon: '◻' },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function SidebarContent({
  isActive,
  logout,
  onNav,
}: {
  isActive: (href: string) => boolean;
  logout: () => void;
  onNav?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-[#1e2535] px-5">
        <span className="rounded-sm bg-white/5 px-1 py-0.5">
          <Image
            src="/logo-bangla.png"
            alt="Xtra Time Bangla logo"
            width={168}
            height={50}
            className="h-9 w-auto"
            priority
          />
        </span>
        <div className="flex flex-col leading-none">
          <span className="mt-1 rounded bg-[#1e2535] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1.5 px-5 text-[10px] font-black uppercase tracking-widest text-slate-600">
              {section.label}
            </p>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNav}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[var(--admin-accent)] text-white'
                    : 'text-slate-400 hover:bg-[#1a2235] hover:text-white'
                }`}
              >
                <span className="w-4 text-center text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#1e2535] p-4 space-y-1">
        <ThemeToggle compact />
        <a
          href={site.webUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-[#1a2235] hover:text-white"
        >
          <span>↗</span> View Site
        </a>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-[#1a2235] hover:text-white"
        >
          <span>⏻</span> Logout
        </button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const currentLabel = ALL_ITEMS.find((i) => isActive(i.href))?.label ?? 'Admin';

  return (
    <div className="flex min-h-screen">

      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <aside
        className="hidden lg:flex w-60 shrink-0 flex-col"
        style={{ background: 'var(--admin-sidebar)', borderRight: '1px solid #1e2535' }}
      >
        <SidebarContent isActive={isActive} logout={logout} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col shadow-2xl"
            style={{ background: 'var(--admin-sidebar)', animation: 'slideInLeft 0.2s ease-out' }}
          >
            <SidebarContent
              isActive={isActive}
              logout={logout}
              onNav={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-auto" style={{ background: 'var(--admin-bg)' }}>

        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg lg:hidden"
              style={{ background: 'var(--admin-sidebar)', color: '#9ca3af' }}
              aria-label="Open sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>
              {currentLabel}
            </p>
          </div>

          <a
            href={site.webUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
          >
            ↗ <span className="hidden sm:inline">Preview Site</span><span className="sm:hidden">Site</span>
          </a>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8" style={{ color: 'var(--admin-text)' }}>
          {children}
        </div>
      </main>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
