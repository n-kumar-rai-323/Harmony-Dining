import { adminApi } from '../api';

export const HOMEPAGE_PATH = '/admin/homepage';

export const SECTION_KEYS = [
  'hero',
  'dining',
  'animated',
  'eventsShowcase',
  'reservationCta',
  'reviews',
  'location',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABEL: Record<SectionKey, string> = {
  hero: 'Hero',
  dining: 'Dining experience',
  animated: 'Experience stories',
  eventsShowcase: 'Events showcase',
  reservationCta: 'Reservation call-to-action',
  reviews: 'Reviews heading',
  location: 'Location & contact',
};

export type SectionEntry = {
  value: Record<string, unknown> | null;
  isPublished: boolean;
  updatedAt: string | null;
  updatedById: string | null;
};

export type HomepageAdminView = Record<SectionKey, SectionEntry>;

export const homepageApi = {
  getAll: () => adminApi.get<HomepageAdminView>(HOMEPAGE_PATH),
  save: (key: SectionKey, value: unknown) =>
    adminApi.put(`${HOMEPAGE_PATH}/${key}`, value),
  setPublished: (key: SectionKey, isPublished: boolean) =>
    adminApi.patch(`${HOMEPAGE_PATH}/${key}/publish`, { isPublished }),
};

// Simple text fields common to most sections — surfaced as real inputs; the
// rest of each section is edited as JSON.
export const COMMON_TEXT_FIELDS = [
  'eyebrow',
  'title',
  'accentTitle',
  'closingTitle',
  'description',
  'supportingNote',
  'helperText',
  'estimateNote',
  'imageLabel',
  'imageCaption',
  'imageMeta',
] as const;
