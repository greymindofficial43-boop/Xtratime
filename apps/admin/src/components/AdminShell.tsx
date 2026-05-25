'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { site } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/articles', label: 'Articles' },
  { href: '/matches', label: 'Matches' },
  { href: '/ads', label: 'Ads' },
  { href: '/categories', label: 'Categories' },
  { href: '/tags', label: 'Tags' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-[var(--admin-sidebar)] p-4 text-white">
        <div className="mb-8">
          <p className="text-lg font-bold">
            SK <span className="text-[var(--admin-accent)]">Admin</span>
          </p>
          <p className="text-xs text-slate-400">Content Management</p>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith(item.href)
                  ? 'bg-[var(--admin-accent)] text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-slate-700 pt-4">
          <ThemeToggle compact />
          <a
            href={site.webUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block px-3 py-2 text-sm text-slate-400 hover:text-white"
          >
            View Site →
          </a>
          <button
            onClick={logout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[var(--admin-bg)] p-8 text-[var(--admin-text)]">
        {children}
      </main>
    </div>
  );
}
