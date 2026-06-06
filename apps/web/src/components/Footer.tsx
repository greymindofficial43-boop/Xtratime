'use client';

import Image from 'next/image';
import Link from 'next/link';
import { branding, isExternal } from '@/lib/branding';

const FOOTER_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Advertise', href: '#' },
];

const SPORTS_LINKS = [
  { label: '🏏 Cricket', slug: 'cricket' },
  { label: '🏀 NBA', slug: 'nba' },
  { label: '🏈 NFL', slug: 'nfl' },
  { label: '⚽ Football', slug: 'football' },
  { label: '🎮 Gaming', slug: 'gaming' },
  { label: '🎾 Tennis', slug: 'tennis' },
  { label: '🤼 WWE', slug: 'wwe' },
  { label: '🏒 NHL', slug: 'nhl' },
  { label: '⚾ MLB', slug: 'mlb' },
  { label: '🏎️ F1', slug: 'f1' },
];

export function Footer() {
  return (
    <footer className="mt-14 border-t border-[var(--sn-header-border)] bg-[var(--sn-header-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
                <Image
                  src={branding.logoSecondary}
                  alt={`${branding.siteName} logo`}
                  width={624}
                  height={322}
                  unoptimized={isExternal(branding.logoSecondary)}
                  className="h-8 w-auto object-contain"
                />
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--sn-header-nav)]">
              Your go-to destination for breaking sports news, live scores, and in-depth analysis across cricket, football, basketball, and more.
            </p>
            <div className="mt-4 flex gap-3">
              {['𝕏', 'f', 'in'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--sn-header-border)] text-sm font-bold text-[var(--sn-header-nav)] transition hover:border-[var(--sn-accent)] hover:text-white"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-white">Explore</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--sn-header-nav)] transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-white">Sports</p>
            <div className="flex flex-wrap gap-2">
              {SPORTS_LINKS.map((sport) => (
                <Link
                  key={sport.slug}
                  href={`/category/${sport.slug}`}
                  className="rounded-lg border border-[var(--sn-header-border)] px-2.5 py-1 text-xs text-[var(--sn-header-nav)] transition hover:border-[var(--sn-accent)] hover:text-white"
                >
                  {sport.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-white">
              Stay Updated
            </p>
            <p className="mb-3 text-sm text-[var(--sn-header-nav)]">
              Get the latest sports news delivered to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg border border-[var(--sn-header-border)] bg-[var(--sn-surface-2)] px-3 py-2 text-sm text-[var(--sn-text)] placeholder:text-[var(--sn-muted)] focus:border-[var(--sn-accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[var(--sn-accent)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--sn-accent-hover)]"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--sn-header-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row">
          <p className="text-xs text-[var(--sn-header-nav)]">
            © {new Date().getFullYear()} Xtra Time — For the hardcore sports fan
          </p>
          <div className="flex gap-4 text-xs text-[var(--sn-header-nav)]">
            <Link href="#" className="hover:text-white transition">Privacy</Link>
            <Link href="#" className="hover:text-white transition">Terms</Link>
            <Link href="#" className="hover:text-white transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
