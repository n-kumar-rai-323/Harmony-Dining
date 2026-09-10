import { adminApi } from '../api';

export const SITE_SETTINGS_PATH = '/admin/site-settings';

export type Business = {
  name: string;
  phone: string;
  email: string;
  addressLines: string[];
  latitude: number;
  longitude: number;
  mapHref: string;
};

export type HoursEntry = { label: string; value: string };

export const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'x',
  'linkedin',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
  brandColor?: string;
};

type Wrapped<T> = { value: T; updatedAt: string | null; updatedById: string | null };

export type SiteSettingsAdminView = {
  business: Wrapped<Business>;
  hours: Wrapped<HoursEntry[]>;
  social: Wrapped<SocialLink[]>;
};

export const siteSettingsApi = {
  getAll: () => adminApi.get<SiteSettingsAdminView>(SITE_SETTINGS_PATH),
  saveBusiness: (dto: Business) =>
    adminApi.put(`${SITE_SETTINGS_PATH}/business`, dto),
  saveHours: (entries: HoursEntry[]) =>
    adminApi.put(`${SITE_SETTINGS_PATH}/hours`, { entries }),
  saveSocial: (links: SocialLink[]) =>
    adminApi.put(`${SITE_SETTINGS_PATH}/social`, { links }),
};
