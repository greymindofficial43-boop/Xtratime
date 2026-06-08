// Branding is env-driven so the same codebase can be white-labeled per deployment.
// Set these per Vercel project; when unset they fall back to the bundled /public assets.
export const branding = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Xtra Time',
  // BCP-47 language tag for <html lang>. Set to 'bn' on the Bangla deployment,
  // 'en' on the English one. Drives SEO + screen readers + font rendering.
  siteLocale: process.env.NEXT_PUBLIC_SITE_LOCALE || 'en',
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Live scores, breaking news, trending stories and deep analysis — all in one place.',
  logoPrimary: process.env.NEXT_PUBLIC_LOGO_PRIMARY_URL || '/logo-bangla.png',
  logoSecondary: process.env.NEXT_PUBLIC_LOGO_SECONDARY_URL || '/logo-eng.png',
  // Social profile links — set per deployment. Empty ones are not rendered.
  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '',
    whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP || '',
  },
};

// External logo URLs (e.g. Cloudinary) skip next/image optimization so no
// next.config remotePatterns entry is required per deployment.
export const isExternal = (src: string) => /^https?:\/\//.test(src);
