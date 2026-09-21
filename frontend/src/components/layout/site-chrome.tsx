'use client';

import { usePathname } from 'next/navigation';

import type { SiteContact, SocialLink } from '@/data/site';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import SitePromoOverlay, {
  type SitePromoContent,
} from '@/components/promotions/site-promo-overlay';
import SocialFloatingBar from '@/components/layout/social-floating-bar';

type SiteChromeProps = {
  social: SocialLink[];
  contact: SiteContact;
  promo: SitePromoContent | null;
  children: React.ReactNode;
};

/**
 * Public-site chrome (nav, footer, floating social bar, promo overlay).
 * Suppressed under /admin, which ships its own shell.
 */
export default function SiteChrome({ social, contact, promo, children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname?.startsWith('/admin/');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SitePromoOverlay content={promo} />

      <Navbar />
      <SocialFloatingBar links={social} />

      {children}

      <Footer social={social} contact={contact} />
    </>
  );
}
