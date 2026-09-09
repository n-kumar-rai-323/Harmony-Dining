import type { MetadataRoute } from 'next';

import { getPastEventSlugs } from '@/data/past-events';
import { env } from '@/lib/env';

const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/menu', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/events', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/reservation', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(
    (route) => ({
      url: `${env.siteUrl}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  const pastEventEntries: MetadataRoute.Sitemap =
    getPastEventSlugs().map((slug) => ({
      url: `${env.siteUrl}/events/past/${slug}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    }));

  return [...staticEntries, ...pastEventEntries];
}
