import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import type {
  BusinessDto,
  SiteSettingKey,
  SocialLinkDto,
  HoursEntryDto,
} from './dto';

export interface SiteSettingsBundle {
  business: BusinessDto;
  hours: HoursEntryDto[];
  social: SocialLinkDto[];
}

// Shipped defaults — mirror prisma/seed.ts so the API always returns a usable
// shape even before an admin has saved anything.
const DEFAULTS: SiteSettingsBundle = {
  business: {
    name: 'Harmony Dining & Event Center',
    phone: '',
    email: '',
    addressLines: ['Harmony Dining & Event Center', 'Kumaripati, Lalitpur'],
    latitude: 27.6718846,
    longitude: 85.3195215,
    mapHref: '/#location',
  },
  hours: [{ label: 'Mon – Sun', value: '10:00 AM – 10:00 PM' }],
  social: [
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
  ],
};

@Injectable()
export class SiteSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Public, cache-friendly bundle consumed by the site (footer, contact, …). */
  async getPublicBundle(): Promise<SiteSettingsBundle> {
    const rows = await this.prisma.siteSetting.findMany({
      where: { key: { in: ['business', 'hours', 'social'] } },
    });
    const byKey = new Map(rows.map((r) => [r.key, r.value as unknown]));
    return {
      business: (byKey.get('business') as BusinessDto) ?? DEFAULTS.business,
      hours: (byKey.get('hours') as HoursEntryDto[]) ?? DEFAULTS.hours,
      social: (byKey.get('social') as SocialLinkDto[]) ?? DEFAULTS.social,
    };
  }

  /** Admin view — same content plus audit metadata. */
  async getAdminView() {
    const rows = await this.prisma.siteSetting.findMany({
      where: { key: { in: ['business', 'hours', 'social'] } },
    });
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const bundle = await this.getPublicBundle();
    const meta = (key: string) => {
      const row = byKey.get(key);
      return {
        updatedAt: row?.updatedAt ?? null,
        updatedById: row?.updatedById ?? null,
      };
    };
    return {
      business: { value: bundle.business, ...meta('business') },
      hours: { value: bundle.hours, ...meta('hours') },
      social: { value: bundle.social, ...meta('social') },
    };
  }

  async update(
    key: SiteSettingKey,
    value: unknown,
    ctx: AuditContext,
  ): Promise<{ key: string; value: unknown }> {
    const existing = await this.prisma.siteSetting.findUnique({
      where: { key },
    });

    const row = await this.prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as never, updatedById: ctx.actorId ?? null },
      create: { key, value: value as never, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: `site_setting.update`,
      entityType: 'SiteSetting',
      entityId: key,
      before: existing?.value ?? null,
      after: row.value,
    });

    return { key: row.key, value: row.value };
  }
}
