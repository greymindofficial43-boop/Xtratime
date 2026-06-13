import Image from 'next/image';
import Link from 'next/link';
import { branding, isExternal } from '@/lib/branding';
import { api } from '@/lib/api';
import { t } from '@/lib/strings';
import { SocialLinks } from './SocialLinks';

const FOOTER_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Advertise', href: '#' },
];

export async function Footer() {
  const allCategories = await api.getCategories().catch(() => []);
  // Top-level categories only, in nav order
  const categories = allCategories
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99));

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
                  className="w-auto object-contain"
                  style={{ height: '1.75rem', width: 'auto' }}
                />
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--sn-header-nav)]">
              {branding.siteName} — {t.footerTagline}
            </p>
            <SocialLinks className="mt-4" />
          </div>

          {/* Explore */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--sn-nav-strong)]">Explore</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--sn-header-nav)] transition hover:text-[var(--sn-nav-strong)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports — pulled from DB */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--sn-nav-strong)]">{t.footerCategories}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="rounded-lg border border-[var(--sn-header-border)] px-2.5 py-1 text-xs text-[var(--sn-header-nav)] transition hover:border-[var(--sn-accent)] hover:text-[var(--sn-nav-strong)]"
                >
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--sn-nav-strong)]">
              {t.footerNewsletterHeading}
            </p>
            <p className="mb-3 text-sm text-[var(--sn-header-nav)]">
              {t.footerNewsletterBody}
            </p>
            <form className="flex gap-2" method="post" action="#">
              <input
                type="email"
                name="email"
                placeholder={t.footerEmailPlaceholder}
                className="flex-1 rounded-lg border border-[var(--sn-header-border)] bg-[var(--sn-surface-2)] px-3 py-2 text-sm text-[var(--sn-text)] placeholder:text-[var(--sn-muted)] focus:border-[var(--sn-accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[var(--sn-accent)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--sn-accent-hover)]"
              >
                {t.footerSubscribe}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--sn-header-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row">
          <p className="text-xs text-[var(--sn-header-nav)]">
            © {new Date().getFullYear()} {branding.siteName} — {t.footerAllRightsReserved}
          </p>
          <div className="flex gap-4 text-xs text-[var(--sn-header-nav)]">
            <Link href="#" className="transition hover:text-[var(--sn-nav-strong)]">{t.footerPrivacy}</Link>
            <Link href="#" className="transition hover:text-[var(--sn-nav-strong)]">{t.footerTerms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
