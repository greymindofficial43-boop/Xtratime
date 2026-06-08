// Branding is env-driven so the same codebase can be white-labeled per deployment.
// Set these per Vercel project; when unset they fall back to the bundled /public assets.

const siteLocale = process.env.NEXT_PUBLIC_SITE_LOCALE || 'en';

type SocialKey = 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'whatsapp';

// Per-locale default social links. Env vars (NEXT_PUBLIC_SOCIAL_*) override these
// per deployment; defaults keep each edition's handles correct without config.
const SOCIAL_DEFAULTS: Record<string, Partial<Record<SocialKey, string>>> = {
  bn: {
    facebook: 'https://www.facebook.com/share/1E5i4xcBQW/',
    instagram: 'https://www.instagram.com/xtratime.bangla?igsh=cnd4cDAzZnMwcmM',
    twitter: 'https://x.com/XtratimeB',
    youtube: 'https://youtube.com/@xtratimebangla?si=SdN33FN0wXi0OvOU',
  },
  // en: { facebook: '...', ... }  // add the English site's handles here later
};

const socialDefaults = SOCIAL_DEFAULTS[siteLocale] ?? {};

export const branding = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Xtra Time',
  // BCP-47 language tag for <html lang>. Set to 'bn' on the Bangla deployment,
  // 'en' on the English one. Drives SEO + screen readers + font rendering.
  siteLocale,
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Live scores, breaking news, trending stories and deep analysis — all in one place.',
  logoPrimary: process.env.NEXT_PUBLIC_LOGO_PRIMARY_URL || '/logo-bangla.png',
  logoSecondary: process.env.NEXT_PUBLIC_LOGO_SECONDARY_URL || '/logo-eng.png',
  // Social profile links — env overrides per-locale defaults; empty ones aren't rendered.
  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || socialDefaults.facebook || '',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || socialDefaults.twitter || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || socialDefaults.instagram || '',
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || socialDefaults.youtube || '',
    whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || socialDefaults.whatsapp || '',
  },
};

// External logo URLs (e.g. Cloudinary) skip next/image optimization so no
// next.config remotePatterns entry is required per deployment.
export const isExternal = (src: string) => /^https?:\/\//.test(src);
