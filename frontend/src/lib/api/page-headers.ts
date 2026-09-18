import { apiGet } from './client';

export type PageHeaderCta = { label: string; href: string };

export type PageHeaderContent = {
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

export type PageHeaderBundle = Record<PageHeaderKey, PageHeaderContent | null>;

const EMPTY: PageHeaderBundle = {
  about: null,
  contact: null,
  events: null,
  gallery: null,
  menu: null,
  reservation: null,
  reviews: null,
};

type RawBundle = Partial<Record<PageHeaderKey, unknown>>;

function header(value: unknown): PageHeaderContent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const title = (value as { title?: unknown }).title;
  if (typeof title !== 'string' || title.trim().length === 0) return null;
  return value as PageHeaderContent;
}

/**
 * Admin-managed hero/banner copy for public pages other than the homepage
 * (which has its own richer CMS — see lib/api/homepage.ts), from
 * GET /api/public/page-headers.
 *
 * Every key is nullable: callers pass `bundle.key ?? undefined` and the page
 * component falls back to its own built-in default content.
 */
export async function getPageHeaders(): Promise<PageHeaderBundle> {
  const data = await apiGet<RawBundle>('/public/page-headers', {
    revalidate: 300,
  });
  if (!data) return EMPTY;

  return {
    about: header(data.about),
    contact: header(data.contact),
    events: header(data.events),
    gallery: header(data.gallery),
    menu: header(data.menu),
    reservation: header(data.reservation),
    reviews: header(data.reviews),
  };
}
