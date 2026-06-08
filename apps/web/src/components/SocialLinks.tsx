import { branding } from '@/lib/branding';

// Inline SVG icons (no icon dependency). 20x20 viewBox, currentColor.
const ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M13.5 3H11a3.5 3.5 0 0 0-3.5 3.5V9H6v3h1.5v6h3v-6H13l.5-3h-3V6.5A.5.5 0 0 1 11 6h2.5V3Z" />
  ),
  twitter: (
    <path d="M17.5 3h-2.6l-3 4-2.6-4H4l4.9 7-4.6 6.9h2.6l3.2-4.4 3 4.4h3.4l-5.1-7.3L17.5 3Z" />
  ),
  instagram: (
    <path d="M14 3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Zm-4 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm4.2-1.7a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
  ),
  youtube: (
    <path d="M18 7.2a2 2 0 0 0-1.4-1.4C15.3 5.5 10 5.5 10 5.5s-5.3 0-6.6.3A2 2 0 0 0 2 7.2 21 21 0 0 0 1.7 11 21 21 0 0 0 2 14.8a2 2 0 0 0 1.4 1.4c1.3.3 6.6.3 6.6.3s5.3 0 6.6-.3a2 2 0 0 0 1.4-1.4 21 21 0 0 0 .3-3.8 21 21 0 0 0-.3-3.8ZM8.3 13.3V8.7l4 2.3-4 2.3Z" />
  ),
  whatsapp: (
    <path d="M10 2a8 8 0 0 0-6.9 12L2 18l4.1-1.1A8 8 0 1 0 10 2Zm4.3 11c-.2.5-1 1-1.5 1-.4 0-.9.2-2.9-.6-2.4-1-3.9-3.5-4-3.7-.1-.2-1-1.3-1-2.4s.6-1.7.8-1.9c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.7 1.7c0 .2.1.4 0 .5l-.3.5-.3.3c-.1.1-.3.3-.1.5l.8 1.2c.5.6 1 .9 1.3 1l.5.2c.1 0 .3 0 .4-.1l.5-.6c.2-.3.4-.2.6-.1l1.6.8c.2.1.4.2.4.3.1.1.1.5-.1 1Z" />
  ),
};

const LABELS: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
};

function normalize(key: string, value: string): string {
  // Allow bare phone numbers for WhatsApp.
  if (key === 'whatsapp' && /^[+0-9][0-9\s-]+$/.test(value)) {
    return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
  }
  return value;
}

export function SocialLinks({ className = '' }: { className?: string }) {
  const entries = Object.entries(branding.social).filter(([, v]) => v);
  if (entries.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {entries.map(([key, value]) => (
        <a
          key={key}
          href={normalize(key, value)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={LABELS[key] ?? key}
          title={LABELS[key] ?? key}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--sk-border)] text-[var(--sk-muted)] transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            {ICONS[key]}
          </svg>
        </a>
      ))}
    </div>
  );
}
