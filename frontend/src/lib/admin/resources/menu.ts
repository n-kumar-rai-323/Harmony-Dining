import { adminApi } from '../api';
import type { Paginated } from '../types';

export const MENU_PATH = '/admin/menu';

export type MenuGroup = 'FOOD' | 'BEVERAGES' | 'BAR';
export type PublishStatus = 'DRAFT' | 'PUBLISHED';
export type DietaryType = 'VEG' | 'NON_VEG' | 'EGG';

export const MENU_GROUPS: MenuGroup[] = ['FOOD', 'BEVERAGES', 'BAR'];

export type DietaryOption = {
  value: DietaryType;
  label: string;
  color: 'success' | 'warning' | 'error';
  shape: 'dot' | 'triangle';
};

export const DIETARY_TYPES: DietaryOption[] = [
  { value: 'VEG', label: 'Veg', color: 'success', shape: 'dot' },
  { value: 'NON_VEG', label: 'Non-veg', color: 'error', shape: 'triangle' },
  { value: 'EGG', label: 'Egg', color: 'warning', shape: 'dot' },
];

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  group: MenuGroup;
  sortOrder: number;
  status: PublishStatus;
  _count: { items: number };
};

export type MenuVariant = {
  id?: string;
  label: string;
  price: number;
  sortOrder?: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  mediaId: string;
  media: { id: string; url: string } | null;
  dietary: DietaryType | null;
  status: PublishStatus;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  tags: string[];
  ingredients: string[];
  category: { id: string; name: string; group: MenuGroup };
  variants: MenuVariant[];
};

export type CategoryInput = {
  name: string;
  group: MenuGroup;
  description?: string;
};

export type ItemInput = {
  categoryId: string;
  name: string;
  description?: string;
  price?: number | null;
  mediaId: string;
  dietary?: DietaryType | null;
  isAvailable?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  ingredients?: string[];
  variants?: MenuVariant[];
};

export const menuApi = {
  listCategories: () => adminApi.get<MenuCategory[]>(`${MENU_PATH}/categories`),
  createCategory: (body: CategoryInput) =>
    adminApi.post<MenuCategory>(`${MENU_PATH}/categories`, body),
  updateCategory: (id: string, body: Partial<CategoryInput>) =>
    adminApi.patch<MenuCategory>(`${MENU_PATH}/categories/${id}`, body),
  setCategoryPublished: (id: string, published: boolean) =>
    adminApi.post(
      `${MENU_PATH}/categories/${id}/${published ? 'publish' : 'unpublish'}`,
    ),
  deleteCategory: (id: string) =>
    adminApi.delete(`${MENU_PATH}/categories/${id}`),

  listItems: (params: string) =>
    adminApi.get<Paginated<MenuItem>>(`${MENU_PATH}/items${params}`),
  createItem: (body: ItemInput) =>
    adminApi.post<MenuItem>(`${MENU_PATH}/items`, body),
  updateItem: (id: string, body: Partial<ItemInput>) =>
    adminApi.patch<MenuItem>(`${MENU_PATH}/items/${id}`, body),
  setItemPublished: (id: string, published: boolean) =>
    adminApi.post(
      `${MENU_PATH}/items/${id}/${published ? 'publish' : 'unpublish'}`,
    ),
  deleteItem: (id: string) => adminApi.delete(`${MENU_PATH}/items/${id}`),
};

export function formatPrice(item: Pick<MenuItem, 'price' | 'variants'>) {
  if (item.variants.length > 0) {
    const prices = item.variants.map((v) => v.price).sort((a, b) => a - b);
    return `Rs ${prices[0]}${prices.length > 1 ? `–${prices[prices.length - 1]}` : ''}`;
  }
  if (item.price != null) return `Rs ${item.price}`;
  return '—';
}
