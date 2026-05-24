import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Contact', href: '#' },
];

const SPORTS_LINKS = [
  'WWE',
  'NBA',
  'NFL',
  'Cricket',
  'Football',
  'Tennis',
  'MMA',
  'Gaming',
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--sk-border)] bg-[var(--sk-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="sk-header-logo text-2xl">sportskeeda</p>
            <p className="mt-2 text-sm text-[var(--sk-muted)]">
              Sports, Gaming &amp; Entertainment News
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--sk-muted)]">
              Stay connected
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--sk-text)]">Explore</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[var(--sk-muted)] hover:text-[var(--sk-accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--sk-text)]">Popular Sports</p>
            <div className="flex flex-wrap gap-2">
              {SPORTS_LINKS.map((sport) => (
                <span
                  key={sport}
                  className="rounded-full border border-[var(--sk-border)] px-3 py-1 text-xs text-[var(--sk-muted)]"
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-[var(--sk-border)] pt-6 text-center text-xs text-[var(--sk-muted)]">
          © {new Date().getFullYear()} Sportskeeda — For the hardcore sports fan
        </p>
      </div>
    </footer>
  );
}
