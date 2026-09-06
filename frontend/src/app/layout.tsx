import type { Metadata } from 'next';

import {
  Cormorant_Garamond,
  Inter,
} from 'next/font/google';

import 'leaflet/dist/leaflet.css';
import './globals.css';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import SitePromoOverlay from '@/components/promotions/site-promo-overlay';
import ThemeRegistry from '@/theme/theme-provider';

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

export const metadata: Metadata = {
  title: {
    default: 'Harmony Dining & Event Center',
    template: '%s | Harmony Dining & Event Center',
  },

  description:
    'Premium dining, events, reservations, and memorable experiences at Harmony Dining & Event Center.',

  applicationName:
    'Harmony Dining & Event Center',

  category: 'Restaurant',
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
    >
      <body>
        <ThemeRegistry>
            {/* GLOBAL FIRST-VISIT PROMOTIONAL OVERLAY */}
            <SitePromoOverlay />

            <Navbar />

            {children}

            <Footer />
          
        </ThemeRegistry>
      </body>
    </html>
  );
}