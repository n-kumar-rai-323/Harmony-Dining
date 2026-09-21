import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { SitePromoDto } from './dto';

const KEY = 'default';

@Injectable()
export class SitePromoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Published + within its active window, or null — the public site shows
   * nothing until an admin has actually configured and published a promo.
   */
  async getPublic(): Promise<unknown | null> {
    const row = await this.prisma.sitePromo.findUnique({ where: { key: KEY } });
    if (!row || !row.isPublished) return null;

    const content = row.content as unknown as SitePromoDto;
    const now = Date.now();
    if (content.startAt && now < new Date(content.startAt).getTime()) return null;
    if (content.endAt && now > new Date(content.endAt).getTime()) return null;

    return row.content;
  }

  /** Full state + audit metadata — for the admin panel. */
  async getAdminView() {
    const row = await this.prisma.sitePromo.findUnique({ where: { key: KEY } });
    return {
      value: row?.content ?? null,
      isPublished: row?.isPublished ?? false,
      updatedAt: row?.updatedAt ?? null,
      updatedById: row?.updatedById ?? null,
    };
  }

  private validate(value: unknown): void {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Promo content must be an object');
    }
    const instance = plainToInstance(SitePromoDto, value, {
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
    value: unknown,
    ctx: AuditContext,
  ): Promise<{ content: unknown; isPublished: boolean }> {
    this.validate(value);

    const existing = await this.prisma.sitePromo.findUnique({ where: { key: KEY } });
    const row = await this.prisma.sitePromo.upsert({
      where: { key: KEY },
      update: { content: value as never, updatedById: ctx.actorId ?? null },
      create: { key: KEY, content: value as never, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: 'site_promo.update',
      entityType: 'SitePromo',
      entityId: KEY,
      before: existing?.content ?? null,
      after: row.content,
    });

    return { content: row.content, isPublished: row.isPublished };
  }

  async setPublished(
    isPublished: boolean,
    ctx: AuditContext,
  ): Promise<{ isPublished: boolean }> {
    const existing = await this.prisma.sitePromo.findUnique({ where: { key: KEY } });
    if (!existing) {
      throw new BadRequestException(
        'Save the promo content before publishing it.',
      );
    }

    const row = await this.prisma.sitePromo.update({
      where: { key: KEY },
      data: { isPublished, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: isPublished ? 'site_promo.publish' : 'site_promo.unpublish',
      entityType: 'SitePromo',
      entityId: KEY,
      before: { isPublished: existing.isPublished },
      after: { isPublished: row.isPublished },
    });

    return { isPublished: row.isPublished };
  }
}
