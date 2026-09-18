import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { PAGE_HEADER_KEYS, PageHeaderDto, type PageHeaderKey } from './dto';

export type PageHeaderBundle = Record<PageHeaderKey, unknown>;

function emptyBundle(): PageHeaderBundle {
  return Object.fromEntries(
    PAGE_HEADER_KEYS.map((k) => [k, null]),
  ) as PageHeaderBundle;
}

export function isPageHeaderKey(value: string): value is PageHeaderKey {
  return (PAGE_HEADER_KEYS as readonly string[]).includes(value);
}

@Injectable()
export class PageHeadersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Published headers only — consumed by the public pages. */
  async getPublicBundle(): Promise<PageHeaderBundle> {
    const rows = await this.prisma.pageHeader.findMany({
      where: { isPublished: true },
    });
    const bundle = emptyBundle();
    for (const row of rows) {
      if (isPageHeaderKey(row.key)) {
        bundle[row.key] = row.content;
      }
    }
    return bundle;
  }

  /** Every header with publish state + audit metadata — for the admin panel. */
  async getAdminView() {
    const rows = await this.prisma.pageHeader.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return Object.fromEntries(
      PAGE_HEADER_KEYS.map((key) => {
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

  private validate(value: unknown): void {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Header content must be an object');
    }
    const instance = plainToInstance(PageHeaderDto, value, {
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
    key: PageHeaderKey,
    value: unknown,
    ctx: AuditContext,
  ): Promise<{ key: string; content: unknown; isPublished: boolean }> {
    this.validate(value);

    const existing = await this.prisma.pageHeader.findUnique({
      where: { key },
    });
    const row = await this.prisma.pageHeader.upsert({
      where: { key },
      update: { content: value as never, updatedById: ctx.actorId ?? null },
      create: { key, content: value as never, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: 'page_header.update',
      entityType: 'PageHeader',
      entityId: key,
      before: existing?.content ?? null,
      after: row.content,
    });

    return { key: row.key, content: row.content, isPublished: row.isPublished };
  }

  async setPublished(
    key: PageHeaderKey,
    isPublished: boolean,
    ctx: AuditContext,
  ): Promise<{ key: string; isPublished: boolean }> {
    const existing = await this.prisma.pageHeader.findUnique({
      where: { key },
    });
    if (!existing) {
      throw new NotFoundException(
        `Page header "${key}" has no saved content yet — save it before publishing.`,
      );
    }

    const row = await this.prisma.pageHeader.update({
      where: { key },
      data: { isPublished, updatedById: ctx.actorId ?? null },
    });

    await this.audit.record({
      ...ctx,
      action: isPublished ? 'page_header.publish' : 'page_header.unpublish',
      entityType: 'PageHeader',
      entityId: key,
      before: { isPublished: existing.isPublished },
      after: { isPublished: row.isPublished },
    });

    return { key: row.key, isPublished: row.isPublished };
  }
}
