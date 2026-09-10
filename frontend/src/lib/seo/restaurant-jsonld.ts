import { env } from '@/lib/env';
import type { SiteSettings } from '@/lib/api/site';

/**
 * schema.org Restaurant JSON-LD for the whole site. Kept minimal and driven
 * by the admin-managed Site Settings so it never drifts from the footer.
 */
export function restaurantJsonLd(settings: SiteSettings): Record<string, unknown> {
  const { business, contact, social } = settings;

  const openingHours = contact.hours
    .map((h) => `${h.label}: ${h.value}`)
    .filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: business.name,
    url: env.siteUrl,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.addressLines[0] ?? business.name,
      addressLocality: contact.addressLines[1] ?? 'Lalitpur',
      addressCountry: 'NP',
    },
    ...(business.latitude && business.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }
      : {}),
    ...(openingHours.length ? { openingHours } : {}),
    servesCuisine: ['Nepali', 'Indian', 'Continental'],
    acceptsReservations: `${env.siteUrl}/reservation`,
    hasMenu: `${env.siteUrl}/menu`,
    ...(social.length
      ? { sameAs: social.map((s) => s.href).filter(Boolean) }
      : {}),
  };
}
