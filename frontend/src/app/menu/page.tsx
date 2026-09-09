import type { Metadata } from 'next';

import MenuExperience from '@/components/menu/menu-experience';
import { getMenuCategories } from '@/lib/api/menu';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Explore food, beverages and bar selections at Harmony Dining & Event Center.',
  alternates: {
    canonical: '/menu',
  },
};

export default async function MenuPage() {
  const categories = await getMenuCategories();

  return <MenuExperience categories={categories} />;
}
