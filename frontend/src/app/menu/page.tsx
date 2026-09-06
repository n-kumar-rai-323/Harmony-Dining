import type { Metadata } from 'next';

import MenuExperience from '@/components/menu/menu-experience';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Explore food, beverages and bar selections at Harmony Dining & Event Center.',
};

export default function MenuPage() {
  return <MenuExperience />;
}