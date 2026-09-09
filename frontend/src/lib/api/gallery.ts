import {
  getGalleryItems as localGalleryItems,
  getHomeGalleryItems as localHomeGalleryItems,
  type GalleryItem,
  type PublicGalleryCategory,
} from '@/data/gallery';
import { apiGet } from './client';

type ApiGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: PublicGalleryCategory;
  image: string;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  featuredOnHome: boolean;
};

function toLocal(item: ApiGalleryItem): GalleryItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? '',
    category: item.category,
    image: item.image,
    alt: item.alt,
    sortOrder: item.sortOrder,
    featuredOnHome: item.featuredOnHome,
  };
}

/** All published gallery items for the /gallery page. Falls back to local data. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const data = await apiGet<ApiGalleryItem[]>('/public/gallery', {
    revalidate: 300,
  });
  if (!data || data.length === 0) return localGalleryItems();
  return data.map(toLocal);
}

/** Home-page gallery preview items. Falls back to local data. */
export async function getHomeGalleryItems(
  limit = 6,
): Promise<GalleryItem[]> {
  const data = await apiGet<ApiGalleryItem[]>(
    `/public/gallery/home?limit=${limit}`,
    { revalidate: 300 },
  );
  if (!data || data.length === 0) return localHomeGalleryItems(limit);
  return data.map(toLocal);
}
