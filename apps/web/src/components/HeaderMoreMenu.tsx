'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/api';
import { site } from '@/lib/site';

type Props = {
  categories: Category[];
  topNavSlugs: string[];
};

export function HeaderMoreMenu({ categories, topNavSlugs }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const moreCategories = categories.filter((c) => !topNavSlugs.includes(c.slug));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

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
          <div className="py-1">
            <Link
              href={site.adminUrl}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-[var(--sk-accent)] hover:bg-[#2a2a2b]"
            >
              Log in
            </Link>
          </div>

          {moreCategories.length > 0 && (
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
