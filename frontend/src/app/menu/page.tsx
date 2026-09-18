import type { Metadata } from 'next';

import MenuExperience from '@/components/menu/menu-experience';
import { getMenuCategories } from '@/lib/api/menu';
import { getPageHeaders } from '@/lib/api/page-headers';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Explore food, beverages and bar selections at Harmony Dining & Event Center.',
  alternates: {
    canonical: '/menu',
  },
};

export default async function MenuPage() {
  const [categories, { menu: hero }] = await Promise.all([
    getMenuCategories(),
    getPageHeaders(),
  ]);

  return <MenuExperience categories={categories} hero={hero ?? undefined} />;
}
