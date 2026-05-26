'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { site } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';

const NAV_SECTIONS = [
  {
    label: 'Content',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '▦' },
      { href: '/articles', label: 'Articles', icon: '✎' },
      { href: '/categories', label: 'Categories & Nav', icon: '⊞' },
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
    label: 'Monetisation',
    items: [
      { href: '/ads', label: 'Ad Slots', icon: '◻' },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="flex w-60 shrink-0 flex-col"
        style={{ background: 'var(--admin-sidebar)', borderRight: '1px solid #1e2535' }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-[#1e2535] px-5">
          <div className="flex items-baseline gap-0">
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: '1.2rem',
                letterSpacing: '-0.04em',
                color: '#fff',
              }}
            >
              sporty
            </span>
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: '1.2rem',
                letterSpacing: '-0.04em',
                color: 'var(--admin-accent)',
              }}
            >
              newz
            </span>
          </div>
          <span className="ml-1 rounded bg-[#1e2535] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Admin
          </span>
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
        <div className="border-t border-[#1e2535] p-4 space-y-1">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ background: 'var(--admin-bg)' }}>
        {/* Top bar */}
        <div
          className="flex h-16 items-center justify-between border-b px-8"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>
            {NAV_SECTIONS.flatMap((s) => s.items).find((i) => isActive(i.href))?.label ?? 'Admin'}
          </p>
          <a
            href={site.webUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}
          >
            ↗ Preview Site
          </a>
        </div>
        <div className="p-8" style={{ color: 'var(--admin-text)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
