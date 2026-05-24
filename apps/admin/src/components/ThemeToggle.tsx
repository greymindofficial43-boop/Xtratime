'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type Props = { compact?: boolean };

export function ThemeToggle({ compact }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        aria-label="Toggle theme"
      >
        {isDark ? '☀ Light mode' : '☾ Dark mode'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg border border-[var(--admin-border)] px-3 py-1.5 text-sm text-[var(--admin-muted)] hover:border-[var(--admin-accent)]"
      aria-label="Toggle theme"
    >
      {isDark ? '☀ Light' : '☾ Dark'}
    </button>
  );
}
