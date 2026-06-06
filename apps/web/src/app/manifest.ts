import type { MetadataRoute } from 'next';
import { branding } from '@/lib/branding';

// Dynamic so the PWA install name / description are env-driven per deployment
// (Bangla vs English), matching the rest of the white-label branding.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: branding.siteName,
    short_name: branding.siteName,
    description: branding.siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#ff4d00',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
