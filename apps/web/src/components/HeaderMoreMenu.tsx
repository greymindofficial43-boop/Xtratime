'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/api';
import { site } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';

type Props = {
  categories: Category[];
  topNavSlugs: string[];
};

export function HeaderMoreMenu({ categories, topNavSlugs }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const moreCategories = categories.filter((c) => !topNavSlugs.includes(c.slug));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="sk-more-btn flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[var(--sk-header-nav)] transition hover:text-white"
        aria-expanded={open}
        aria-label="More menu"
      >
        <span className="flex flex-col gap-[5px]" aria-hidden>
          <span className="block h-[2px] w-[18px] rounded-full bg-current" />
          <span className="block h-[2px] w-[18px] rounded-full bg-current" />
          <span className="block h-[2px] w-[18px] rounded-full bg-current" />
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden>
          <path
            d="M1 1.5 5 5 9 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="sk-more-panel absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-[var(--sk-header-border)] bg-[var(--sk-header-bg)] shadow-xl">
          {searchOpen ? (
            <form onSubmit={onSearch} className="border-b border-[var(--sk-header-border)] p-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news..."
                autoFocus
                className="w-full rounded-md border border-[var(--sk-header-border)] bg-[#2a2a2b] px-3 py-2 text-sm text-white placeholder:text-[#808080] focus:border-[var(--sk-accent)] focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-[var(--sk-accent)] py-1.5 text-xs font-semibold text-white"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs text-[#808080] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="py-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#c8c8c8] hover:bg-[#2a2a2b] hover:text-white"
              >
                <span className="text-base opacity-70">⌕</span>
                Search
              </button>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-[#c8c8c8]">Theme</span>
                <ThemeToggle />
              </div>
              <Link
                href={site.adminUrl}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-[var(--sk-accent)] hover:bg-[#2a2a2b]"
              >
                Log in
              </Link>
              <a
                href="#"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#c8c8c8] hover:bg-[#2a2a2b] hover:text-white"
              >
                Writers Home
              </a>
            </div>
          )}

          {!searchOpen && moreCategories.length > 0 && (
            <>
              <div className="border-t border-[var(--sk-header-border)] px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#666]">
                  More Sports
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto pb-2">
                {moreCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-[#808080] hover:bg-[#2a2a2b] hover:text-white"
                  >
                    {cat.icon} {cat.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
