// Branding is env-driven so the same codebase can be white-labeled per deployment.
// Set these per Vercel project; when unset they fall back to the bundled /public assets.
export const branding = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Xtra Time',
  logoPrimary: process.env.NEXT_PUBLIC_LOGO_PRIMARY_URL || '/logo-bangla.png',
  logoSecondary: process.env.NEXT_PUBLIC_LOGO_SECONDARY_URL || '/logo-eng.png',
};

// External logo URLs (e.g. Cloudinary) skip next/image optimization so no
// next.config remotePatterns entry is required per deployment.
export const isExternal = (src: string) => /^https?:\/\//.test(src);
