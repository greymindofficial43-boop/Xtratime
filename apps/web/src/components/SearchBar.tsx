'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--sk-muted)] hover:bg-[var(--sk-hover)] hover:text-[var(--sk-text)]"
        aria-label="Search"
      >
        ⌕
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative flex items-center">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        autoFocus
        className="w-36 rounded-full border border-[var(--sk-border)] bg-[var(--sk-surface)] py-1.5 pl-3 pr-8 text-sm text-[var(--sk-text)] placeholder:text-[var(--sk-muted)] focus:border-[var(--sk-accent)] focus:outline-none sm:w-52"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--sk-muted)] hover:text-[var(--sk-text)]"
        aria-label="Close search"
      >
        ×
      </button>
    </form>
  );
}
