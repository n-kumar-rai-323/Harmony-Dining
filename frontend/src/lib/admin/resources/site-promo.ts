import { adminApi } from '../api';

export const SITE_PROMO_PATH = '/admin/site-promo';

export type SitePromoCta = { label: string; href: string };

export type SitePromoValue = {
  startAt?: string;
  endAt?: string;
  eyebrow?: string;
  badge?: string;
  title: string;
  accentTitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  primaryCta?: SitePromoCta;
  secondaryCta?: SitePromoCta;
  note?: string;
};

export type SitePromoAdminView = {
  value: SitePromoValue | null;
  isPublished: boolean;
  updatedAt: string | null;
  updatedById: string | null;
};

export const sitePromoApi = {
  get: () => adminApi.get<SitePromoAdminView>(SITE_PROMO_PATH),
  save: (value: SitePromoValue) => adminApi.put(SITE_PROMO_PATH, value),
  setPublished: (isPublished: boolean) =>
    adminApi.patch(`${SITE_PROMO_PATH}/publish`, { isPublished }),
};
