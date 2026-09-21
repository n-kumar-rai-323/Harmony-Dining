import { apiGet } from './client';
import type { SitePromoContent } from '@/components/promotions/site-promo-overlay';

/**
 * Admin-managed promo popup from GET /api/public/site-promo. Returns null
 * when nothing is published (or nothing configured yet) — the overlay then
 * simply doesn't render, rather than falling back to placeholder content.
 */
export async function getSitePromo(): Promise<SitePromoContent | null> {
  const data = await apiGet<Omit<SitePromoContent, 'id'>>('/public/site-promo', {
    revalidate: 300,
  });
  if (!data || typeof data !== 'object' || !data.title) return null;
  return { id: 'default', ...data };
}
