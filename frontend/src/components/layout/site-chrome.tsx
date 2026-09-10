'use client';

import { usePathname } from 'next/navigation';

import type { SocialLink } from '@/data/site';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import SitePromoOverlay from '@/components/promotions/site-promo-overlay';
import SocialFloatingBar from '@/components/layout/social-floating-bar';

type SiteChromeProps = {
  social: SocialLink[];
  children: React.ReactNode;
};

/**
 * Public-site chrome (nav, footer, floating social bar, promo overlay).
 * Suppressed under /admin, which ships its own shell.
 */
export default function SiteChrome({ social, children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname?.startsWith('/admin/');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SitePromoOverlay />

      <Navbar />
      <SocialFloatingBar links={social} />

      {children}

      <Footer social={social} />
    </>
  );
}
