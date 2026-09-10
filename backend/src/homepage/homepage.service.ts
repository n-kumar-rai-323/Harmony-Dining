import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import {
  HOMEPAGE_SECTION_KEYS,
  SECTION_DTO,
  type HomepageSectionKey,
} from './dto';

export type HomepageBundle = Record<HomepageSectionKey, unknown>;

function emptyBundle(): HomepageBundle {
  return Object.fromEntries(
    HOMEPAGE_SECTION_KEYS.map((k) => [k, null]),
  ) as HomepageBundle;
}

export function isHomepageSectionKey(
  value: string,
): value is HomepageSectionKey {
  return (HOMEPAGE_SECTION_KEYS as readonly string[]).includes(value);
}

@Injectable()
export class HomepageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Published sections only — consumed by the public homepage. */
  async getPublicBundle(): Promise<HomepageBundle> {
    const rows = await this.prisma.homepageSection.findMany({
      where: { isPublished: true },
    });
    const bundle = emptyBundle();
    for (const row of rows) {
      if (isHomepageSectionKey(row.key)) {
        bundle[row.key] = row.content;
      }
    }
    return bundle;
  }

  /** Every section with publish state + audit metadata — for the admin panel. */
  async getAdminView() {
    const rows = await this.prisma.homepageSection.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return Object.fromEntries(
      HOMEPAGE_SECTION_KEYS.map((key) => {
        const row = byKey.get(key);
        return [
          key,
          {
            value: row?.content ?? null,
            isPublished: row?.isPublished ?? true,
            updatedAt: row?.updatedAt ?? null,
            updatedById: row?.updatedById ?? null,
          },
        ];
      }),
    );
  }

  /** Validates the payload against the section's DTO before saving. */
  private validate(key: HomepageSectionKey, value: unknown): void {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Section content must be an object');
    }
    const instance = plainToInstance(SECTION_DTO[key], value, {
      enableImplicitConversion: false,
    });
    const errors = validateSync(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });
    if (errors.length > 0) {
      const flatten = (e: (typeof errors)[number], path = ''): string[] => {
        const here = path ? `${path}.${e.property}` : e.property;
        const own = Object.values(e.constraints ?? {});
        const nested = (e.children ?? []).flatMap((c) => flatten(c, here));
        return [...own.map((m) => `${here}: ${m}`), ...nested];
      };
      throw new BadRequestException(errors.flatMap((e) => flatten(e)));
    }
  }

  async update(
    key: HomepageSectionKey,
    value: unknown,
    ctx: AuditContext,
  ): Promise<{ key: string; content: unknown; isPublished: boolean }> {
    this.validate(key, value);

    const existing = await this.prisma.homepageSection.findUnique({
      where: { key },
    });
    const row = await this.prisma.homepageSection.upsert({
      where: { key },
      update: { content: value as never, updatedById: ctx.actorId ?? null },
      create: { key, content: value as never, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: 'homepage_section.update',
      entityType: 'HomepageSection',
      entityId: key,
      before: existing?.content ?? null,
      after: row.content,
    });

    return { key: row.key, content: row.content, isPublished: row.isPublished };
  }

  async setPublished(
    key: HomepageSectionKey,
    isPublished: boolean,
    ctx: AuditContext,
  ): Promise<{ key: string; isPublished: boolean }> {
    const existing = await this.prisma.homepageSection.findUnique({
      where: { key },
    });
    if (!existing) {
      throw new NotFoundException(
        `Section "${key}" has no saved content yet — save it before publishing.`,
      );
    }

    const row = await this.prisma.homepageSection.update({
      where: { key },
      data: { isPublished, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: isPublished
        ? 'homepage_section.publish'
        : 'homepage_section.unpublish',
      entityType: 'HomepageSection',
      entityId: key,
      before: { isPublished: existing.isPublished },
      after: { isPublished: row.isPublished },
    });

    return { key: row.key, isPublished: row.isPublished };
  }
}
