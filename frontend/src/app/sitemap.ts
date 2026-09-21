import type { MetadataRoute } from 'next';

import { getPastEventSlugs } from '@/lib/api/events';
import { env } from '@/lib/env';

// See frontend/src/app/layout.tsx for why this is forced dynamic.
export const dynamic = 'force-dynamic';

const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/menu', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/events', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/reservation', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
];

/**
 * Static routes plus every published past event, whose slugs come from the
 * API (with a bundled fallback) so the sitemap tracks admin changes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${env.siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const slugs = await getPastEventSlugs();
  const pastEventEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${env.siteUrl}/events/past/${slug}`,
    lastModified,
    changeFrequency: 'yearly',
    priority: 0.4,
  }));

  return [...staticEntries, ...pastEventEntries];
}
