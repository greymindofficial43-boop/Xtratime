import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { BreakingTicker } from '@/components/BreakingTicker';
import { Footer } from '@/components/Footer';
import { TrendingFooter } from '@/components/TrendingFooter';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RandomAdInjector } from '@/components/RandomAdInjector';
import { PopupAd } from '@/components/PopupAd';
import { branding } from '@/lib/branding';
import { site } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['italic', 'normal'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: branding.siteName,
    template: `%s | ${branding.siteName}`,
  },
  description: branding.siteDescription,
  applicationName: branding.siteName,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: branding.siteName,
    title: branding.siteName,
    description: branding.siteDescription,
    url: site.siteUrl,
    locale: branding.siteLocale,
  },
  twitter: {
    card: 'summary_large_image',
    title: branding.siteName,
    description: branding.siteDescription,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: branding.siteName,
  },
  verification: {
    google: branding.siteLocale === 'bn' ? '2_vDCogofsJTslAYVmchVMeMCwsaV0PbczVfAA5xSCw' : 'rYnZXErO_JbunYWG4etr1Smoo7zcyUsHi3O-vPWjo1I',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff4d00',
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={branding.siteLocale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${inter.className} min-h-screen antialiased`}
      >
        {branding.siteLocale === 'en' && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-7C3F99WPP5"
              strategy="afterInteractive"
            />
            <Script id="google-analytics-en" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-7C3F99WPP5');
              `}
            </Script>
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4299633259109805"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          </>
        )}
        {branding.siteLocale === 'bn' && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-8GY4DP66SJ"
              strategy="afterInteractive"
            />
            <Script id="google-analytics-bn" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-8GY4DP66SJ');
              `}
            </Script>
          </>
        )}
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Script id="sw-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        <ThemeProvider>
          <Header />
<BreakingTicker />
          <main>{children}</main>
          <RandomAdInjector />
          <TrendingFooter />
          <Footer />
          <PopupAd />
        </ThemeProvider>
      </body>
    </html>
  );
}
