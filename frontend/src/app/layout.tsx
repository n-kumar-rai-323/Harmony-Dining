import type { Metadata, Viewport } from 'next';

import {
  Cormorant_Garamond,
  Inter,
} from 'next/font/google';

import 'leaflet/dist/leaflet.css';
import './globals.css';

import SiteChrome from '@/components/layout/site-chrome';
import ThemeInitScript from '@/theme/theme-init-script';
import ThemeRegistry from '@/theme/theme-provider';
import { env } from '@/lib/env';
import { getSiteSettings } from '@/lib/api/site';
import { restaurantJsonLd } from '@/lib/seo/restaurant-jsonld';

/* =========================================================
   FONTS
========================================================= */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

/* =========================================================
   GLOBAL SEO METADATA
========================================================= */

const SITE_NAME = 'Harmony Dining & Event Center';
const SITE_DESCRIPTION =
  'Premium dining, events, reservations, and memorable experiences at Harmony Dining & Event Center.';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  category: 'Restaurant',

  keywords: [
    'Harmony Dining',
    'event center',
    'restaurant',
    'private events',
    'table reservation',
    'Kathmandu dining',
  ],

  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // Icons and the social preview image come from the file
  // conventions: app/icon.png, app/apple-icon.png,
  // app/opengraph-image.png.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F3' },
    { media: '(prefers-color-scheme: dark)', color: '#171A18' },
  ],
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const { social } = settings;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          // Server-rendered from admin-managed settings; not user input.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(restaurantJsonLd(settings)),
          }}
        />
        <ThemeInitScript />

        <ThemeRegistry>
          <SiteChrome social={social}>{children}</SiteChrome>
        </ThemeRegistry>
      </body>
    </html>
  );
}
