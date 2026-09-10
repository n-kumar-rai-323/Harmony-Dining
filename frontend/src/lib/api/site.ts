import {
  getSiteContact as localSiteContact,
  getSocialLinks as localSocialLinks,
  type SiteContact,
  type SocialLink,
  type SocialPlatform,
} from '@/data/site';
import { apiGet } from './client';

/* =========================================================
   Shape returned by GET /api/public/site
========================================================= */

type ApiBusiness = {
  name: string;
  phone: string;
  email: string;
  addressLines: string[];
  latitude: number;
  longitude: number;
  mapHref: string;
};

type ApiHoursEntry = { label: string; value: string };

type ApiSocialLink = {
  platform: string;
  label: string;
  href: string;
  brandColor?: string;
};

type ApiSiteBundle = {
  business: ApiBusiness;
  hours: ApiHoursEntry[];
  social: ApiSocialLink[];
};

const KNOWN_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'x',
  'linkedin',
];

const DEFAULT_BRAND_COLOR = '#555555';

function toSocialLink(item: ApiSocialLink): SocialLink | null {
  if (!KNOWN_PLATFORMS.includes(item.platform as SocialPlatform)) return null;
  if (!item.href?.trim() || !item.label?.trim()) return null;
  return {
    platform: item.platform as SocialPlatform,
    label: item.label,
    href: item.href,
    brandColor: item.brandColor?.trim() || DEFAULT_BRAND_COLOR,
  };
}

export type SiteSettings = {
  business: ApiBusiness;
  contact: SiteContact;
  social: SocialLink[];
};

/**
 * Business info, opening hours and social links, from the admin-managed
 * Site Settings API. Falls back to the bundled local values (data/site.ts)
 * when the API is unavailable, so the site never renders without contact info.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await apiGet<ApiSiteBundle>('/public/site', { revalidate: 300 });

  const localContact = localSiteContact();
  const localSocial = localSocialLinks();

  if (!data) {
    return {
      business: {
        name: 'Harmony Dining & Event Center',
        phone: localContact.phone,
        email: localContact.email,
        addressLines: localContact.addressLines,
        latitude: 27.6718846,
        longitude: 85.3195215,
        mapHref: localContact.mapHref,
      },
      contact: localContact,
      social: localSocial,
    };
  }

  const social = data.social
    .map(toSocialLink)
    .filter((x): x is SocialLink => x !== null);

  return {
    business: data.business,
    contact: {
      phone: data.business.phone,
      email: data.business.email,
      addressLines:
        data.business.addressLines.length > 0
          ? data.business.addressLines
          : localContact.addressLines,
      mapHref: data.business.mapHref || localContact.mapHref,
      hours: data.hours.length > 0 ? data.hours : localContact.hours,
    },
    social: social.length > 0 ? social : localSocial,
  };
}
