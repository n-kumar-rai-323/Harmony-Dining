import { adminApi } from '../api';
import type { Paginated } from '../types';

export const GALLERY_PATH = '/admin/gallery';

export type GalleryCategory = 'DINING' | 'EVENTS' | 'SPACES' | 'TEAM' | 'KITCHEN';
export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'DINING',
  'EVENTS',
  'SPACES',
  'TEAM',
  'KITCHEN',
];

export type PublishStatus = 'DRAFT' | 'PUBLISHED';

export type GalleryItem = {
  id: string;
  mediaId: string;
  title: string;
  caption: string | null;
  altText: string;
  category: GalleryCategory;
  sortOrder: number;
  status: PublishStatus;
  featuredOnHome: boolean;
  media: { id: string; url: string; width: number | null; height: number | null };
};

export type GalleryInput = {
  mediaId: string;
  title: string;
  altText: string;
  category: GalleryCategory;
  caption?: string;
  featuredOnHome?: boolean;
};

export const galleryApi = {
  list: (params: string) =>
    adminApi.get<Paginated<GalleryItem>>(`${GALLERY_PATH}${params}`),
  create: (body: GalleryInput) =>
    adminApi.post<GalleryItem>(GALLERY_PATH, body),
  update: (id: string, body: Partial<GalleryInput>) =>
    adminApi.patch<GalleryItem>(`${GALLERY_PATH}/${id}`, body),
  setPublished: (id: string, published: boolean) =>
    adminApi.post(`${GALLERY_PATH}/${id}/${published ? 'publish' : 'unpublish'}`),
  remove: (id: string) => adminApi.delete(`${GALLERY_PATH}/${id}`),
};
