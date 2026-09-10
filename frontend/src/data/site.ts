/* =========================================================
   SITE-WIDE CONTENT

   Single source of truth for details that appear in several
   places (footer, floating bar, contact page, metadata).

   Later:
     Harmony Admin → NestJS API (GET /site) → these accessors.
========================================================= */

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'linkedin';

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
  /** Platform brand colour, used where a coloured icon is shown. */
  brandColor: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@harmonydiningeventcenter',
    brandColor: '#111111',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/people/Harmony-Dining-Event-Center/61593063557390/',
    brandColor: '#1877F2',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/harmonydiningandevent',
    brandColor: '#E1306C',
  },
];

export type SiteContact = {
  /** Blank values are simply not rendered. Fill in when confirmed. */
  phone: string;
  email: string;
  addressLines: string[];
  /** Where "directions" / "view map" links point. */
  mapHref: string;
  hours: { label: string; value: string }[];
};

const SITE_CONTACT: SiteContact = {
  phone: '',
  email: '',
  addressLines: [
    'Harmony Dining & Event Center',
    'Kumaripati, Lalitpur',
  ],
  mapHref: '/#location',
  hours: [
    { label: 'Mon – Sun', value: '10:00 AM – 10:00 PM' },
  ],
};

export function getSocialLinks(): SocialLink[] {
  return SOCIAL_LINKS;
}

export function getSiteContact(): SiteContact {
  return SITE_CONTACT;
}
