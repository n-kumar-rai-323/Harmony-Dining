import {
  menuData,
  type MenuCategory,
  type MenuItem,
} from '@/data/menu-data';
import { apiGet } from './client';

/* =========================================================
   Shapes returned by GET /api/public/menu
========================================================= */

type ApiMenuVariant = { name: string; price: number };

type ApiMenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  priceLabel: string | null;
  imageUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  variants: ApiMenuVariant[];
  categoryName?: string;
};

type ApiMenuCategory = {
  id: string;
  slug: string;
  group: 'FOOD' | 'BEVERAGES' | 'BAR';
  name: string;
  description: string | null;
  items: ApiMenuItem[];
};

/* =========================================================
   Local fallback (the site's original static menu)
========================================================= */

function localVisibleCategories(): MenuCategory[] {
  return menuData
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.status === 'VERIFIED'),
    }))
    .filter((category) => category.items.length > 0);
}

function apiItemToLocal(item: ApiMenuItem): MenuItem {
  return {
    name: item.name,
    price: item.price ?? undefined,
    priceLabel: item.priceLabel ?? undefined,
    description: item.description ?? undefined,
    variants: item.variants.length > 0 ? item.variants : undefined,
    // The public API only ever returns published items.
    status: 'VERIFIED',
  };
}

/* =========================================================
   Public accessors
========================================================= */

/** Full menu for the /menu page. API-driven, falls back to local data. */
export async function getMenuCategories(): Promise<MenuCategory[]> {
  const data = await apiGet<{ categories: ApiMenuCategory[] }>(
    '/public/menu',
    { revalidate: 300 },
  );

  if (!data || data.categories.length === 0) {
    return localVisibleCategories();
  }

  return data.categories.map((category) => ({
    id: category.id,
    group: category.group,
    name: category.name,
    items: category.items.map(apiItemToLocal),
  }));
}

export type FeaturedMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  priceLabel: string | null;
  imageUrl: string | null;
  categoryName: string | null;
  group: 'FOOD' | 'BEVERAGES' | 'BAR' | null;
};

/**
 * Featured items for the homepage section. When the API has none marked
 * featured (or is unavailable) this returns [], and the component keeps
 * its existing local behaviour.
 */
export async function getFeaturedMenuItems(
  limit = 8,
): Promise<FeaturedMenuItem[]> {
  const data = await apiGet<
    Array<ApiMenuItem & { categoryName?: string }>
  >(`/public/menu/featured?limit=${limit}`, { revalidate: 300 });

  if (!data || data.length === 0) return [];

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    priceLabel: item.priceLabel,
    imageUrl: item.imageUrl,
    categoryName: item.categoryName ?? null,
    group: null,
  }));
}
