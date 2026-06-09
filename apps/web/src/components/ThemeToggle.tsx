'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--sk-border)]"
        aria-hidden
      />
    );
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--sn-menu-border)] bg-[var(--sn-menu-bg-2)] text-sm text-[var(--sn-header-nav)] transition hover:border-[var(--sk-accent)] hover:text-[var(--sn-nav-strong)]"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
