import { describe, expect, it } from 'vitest';

import { restaurantJsonLd } from './restaurant-jsonld';
import type { SiteSettings } from '@/lib/api/site';

const settings: SiteSettings = {
  business: {
    name: 'Harmony Dining',
    phone: '',
    email: '',
    addressLines: ['Harmony Dining', 'Kumaripati, Lalitpur'],
    latitude: 27.67,
    longitude: 85.31,
    mapHref: '/#location',
  },
  contact: {
    phone: '+977 1 5555555',
    email: 'hi@harmony.test',
    addressLines: ['Harmony Dining', 'Kumaripati, Lalitpur'],
    mapHref: '/#location',
    hours: [{ label: 'Mon – Sun', value: '10:00 AM – 10:00 PM' }],
  },
  social: [
    {
      platform: 'facebook',
      label: 'Facebook',
      href: 'https://fb.com/harmony',
      brandColor: '#1877F2',
    },
  ],
};

describe('restaurantJsonLd', () => {
  it('produces a schema.org Restaurant node from settings', () => {
    const ld = restaurantJsonLd(settings);
    expect(ld['@type']).toBe('Restaurant');
    expect(ld.name).toBe('Harmony Dining');
    expect(ld.telephone).toBe('+977 1 5555555');
    expect(ld.email).toBe('hi@harmony.test');
    expect(ld.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: 27.67,
      longitude: 85.31,
    });
    expect(ld.openingHours).toEqual(['Mon – Sun: 10:00 AM – 10:00 PM']);
    expect(ld.sameAs).toEqual(['https://fb.com/harmony']);
    expect(ld.hasMenu).toContain('/menu');
  });

  it('omits optional fields when data is missing', () => {
    const bare = restaurantJsonLd({
      ...settings,
      contact: { ...settings.contact, phone: '', email: '', hours: [] },
      social: [],
    });
    expect(bare).not.toHaveProperty('telephone');
    expect(bare).not.toHaveProperty('openingHours');
    expect(bare).not.toHaveProperty('sameAs');
  });
});
