// Public site URL the admin links out to (e.g. "View" article, "View site").
// Guard against an empty/blank NEXT_PUBLIC_SITE_URL — otherwise links like
// `${webUrl}/cat/slug` collapse to a relative path and resolve to the ADMIN
// domain instead of the public site. Trailing slash is stripped.
const _siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();

export const site = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  webUrl: (_siteUrl || 'https://xtratimebangla.in').replace(/\/+$/, ''),
};
