import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { BreakingTicker } from '@/components/BreakingTicker';
import { Footer } from '@/components/Footer';
import { TrendingFooter } from '@/components/TrendingFooter';
import { Header } from '@/components/Header';
import { SubHeader } from '@/components/SubHeader';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RandomAdInjector } from '@/components/RandomAdInjector';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['italic', 'normal'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Xtra Time — Live Scores, Sports News & Updates',
  description:
    'Xtra Time covers cricket, football, NBA, NFL, NHL and more. Live scores, breaking news, trending stories and deep analysis — all in one place.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Xtra Time',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff4d00',
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${inter.className} min-h-screen antialiased`}
      >
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
          <SubHeader />
          <BreakingTicker />
          <main>{children}</main>
          <RandomAdInjector />
          <TrendingFooter />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
