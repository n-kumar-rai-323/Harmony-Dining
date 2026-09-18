import { adminApi } from '../api';

export const PAGE_HEADERS_PATH = '/admin/page-headers';

export const PAGE_HEADER_KEYS = [
  'about',
  'contact',
  'events',
  'gallery',
  'menu',
  'reservation',
  'reviews',
] as const;

export type PageHeaderKey = (typeof PAGE_HEADER_KEYS)[number];

export const PAGE_HEADER_LABEL: Record<PageHeaderKey, string> = {
  about: 'About',
  contact: 'Contact',
  events: 'Events',
  gallery: 'Gallery',
  menu: 'Menu',
  reservation: 'Reservation',
  reviews: 'Reviews',
};

// Which optional fields each page's hero actually renders — drives which
// inputs the admin form shows for a given page.
export const PAGE_HEADER_FIELDS: Record<
  PageHeaderKey,
  { image: boolean; badges: boolean; primaryCta: boolean; secondaryCta: boolean }
> = {
  about: { image: true, badges: false, primaryCta: false, secondaryCta: false },
  contact: { image: false, badges: false, primaryCta: false, secondaryCta: false },
  events: { image: true, badges: false, primaryCta: true, secondaryCta: true },
  gallery: { image: true, badges: false, primaryCta: true, secondaryCta: true },
  menu: { image: true, badges: true, primaryCta: false, secondaryCta: false },
  reservation: { image: true, badges: false, primaryCta: true, secondaryCta: false },
  reviews: { image: false, badges: false, primaryCta: false, secondaryCta: false },
};

export type PageHeaderCta = { label: string; href: string };

export type PageHeaderValue = {
  eyebrow?: string;
  title: string;
  accentTitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badges?: { label: string }[];
  primaryCta?: PageHeaderCta;
  secondaryCta?: PageHeaderCta;
};

export type PageHeaderEntry = {
  value: PageHeaderValue | null;
  isPublished: boolean;
  updatedAt: string | null;
  updatedById: string | null;
};

export type PageHeadersAdminView = Record<PageHeaderKey, PageHeaderEntry>;

export const pageHeadersApi = {
  getAll: () => adminApi.get<PageHeadersAdminView>(PAGE_HEADERS_PATH),
  save: (key: PageHeaderKey, value: PageHeaderValue) =>
    adminApi.put(`${PAGE_HEADERS_PATH}/${key}`, value),
  setPublished: (key: PageHeaderKey, isPublished: boolean) =>
    adminApi.patch(`${PAGE_HEADERS_PATH}/${key}/publish`, { isPublished }),
};
