import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublishStatus, type EventLifecycle } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { paginate } from '../common/pagination';
import { uniqueSlug } from '../common/slug.util';
import type {
  CreateEventDto,
  EventMediaInputDto,
  EventQueryDto,
  UpdateEventDto,
} from './dto';

const INCLUDE = {
  coverMedia: { select: { id: true, url: true } },
  media: {
    orderBy: { sortOrder: 'asc' },
    include: {
      media: { select: { id: true, url: true, mimeType: true } },
      posterMedia: { select: { id: true, url: true } },
    },
  },
} satisfies Prisma.EventInclude;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: EventQueryDto) {
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.lifecycle ? { lifecycle: query.lifecycle } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { category: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        include: INCLUDE,
        orderBy: { eventDate: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.event.count({ where }),
    ]);
    return paginate(items, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE,
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto, ctx: AuditContext) {
    await this.assertMedia(dto.coverMediaId ?? undefined);
    await this.assertMediaList(dto.media);

    const slug = await uniqueSlug(dto.title, (s) =>
      this.prisma.event.findUnique({ where: { slug: s } }).then(Boolean),
    );

    const created = await this.prisma.event.create({
      data: {
        slug,
        title: dto.title.trim(),
        category: dto.category.trim(),
        summary: dto.summary.trim(),
        description: dto.description?.trim() || null,
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        guestsLabel: dto.guestsLabel?.trim() || null,
        coverMediaId: dto.coverMediaId ?? null,
        lifecycle: dto.lifecycle ?? 'UPCOMING',
        media: dto.media?.length
          ? {
              create: dto.media.map((m, i) => ({
                mediaId: m.mediaId,
                type: m.type,
                posterMediaId: m.posterMediaId ?? null,
                altText: m.altText.trim(),
                sortOrder: m.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: INCLUDE,
    });
    await this.audit.record({
      ...ctx,
      action: 'event.create',
      entityType: 'Event',
      entityId: created.id,
      after: { slug: created.slug, title: created.title },
    });
    return created;
  }

  async update(id: string, dto: UpdateEventDto, ctx: AuditContext) {
    const before = await this.get(id);
    if (dto.coverMediaId !== undefined) {
      await this.assertMedia(dto.coverMediaId ?? undefined);
    }
    if (dto.media) await this.assertMediaList(dto.media);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.media) {
        const keep = dto.media.map((m) => m.id).filter(Boolean) as string[];
        await tx.eventMedia.deleteMany({
          where: { eventId: id, id: { notIn: keep } },
        });
        for (const [i, m] of dto.media.entries()) {
          if (m.id) {
            await tx.eventMedia.update({
              where: { id: m.id },
              data: {
                mediaId: m.mediaId,
                type: m.type,
                posterMediaId: m.posterMediaId ?? null,
                altText: m.altText.trim(),
                sortOrder: m.sortOrder ?? i,
              },
            });
          } else {
            await tx.eventMedia.create({
              data: {
                eventId: id,
                mediaId: m.mediaId,
                type: m.type,
                posterMediaId: m.posterMediaId ?? null,
                altText: m.altText.trim(),
                sortOrder: m.sortOrder ?? i,
              },
            });
          }
        }
      }
      return tx.event.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          category: dto.category?.trim(),
          summary: dto.summary?.trim(),
          description:
            dto.description === undefined
              ? undefined
              : dto.description.trim() || null,
          eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
          startTime: dto.startTime === undefined ? undefined : dto.startTime,
          endTime: dto.endTime === undefined ? undefined : dto.endTime,
          guestsLabel:
            dto.guestsLabel === undefined
              ? undefined
              : dto.guestsLabel?.trim() || null,
          coverMediaId:
            dto.coverMediaId === undefined ? undefined : dto.coverMediaId,
          lifecycle: dto.lifecycle,
        },
        include: INCLUDE,
      });
    });

    await this.audit.record({
      ...ctx,
      action: 'event.update',
      entityType: 'Event',
      entityId: id,
      before: { title: before.title, lifecycle: before.lifecycle },
      after: { title: updated.title, lifecycle: updated.lifecycle },
    });
    return updated;
  }

  async setStatus(id: string, status: PublishStatus, ctx: AuditContext) {
    const before = await this.get(id);
    if (before.status === status) return before;
    const updated = await this.prisma.event.update({
      where: { id },
      data: { status },
      include: INCLUDE,
    });
    await this.audit.record({
      ...ctx,
      action: `event.${status === 'PUBLISHED' ? 'publish' : 'unpublish'}`,
      entityType: 'Event',
      entityId: id,
      before: { status: before.status },
      after: { status },
    });
    return updated;
  }

  async setLifecycle(
    id: string,
    lifecycle: EventLifecycle,
    ctx: AuditContext,
  ) {
    const before = await this.get(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: { lifecycle },
      include: INCLUDE,
    });
    await this.audit.record({
      ...ctx,
      action: 'event.lifecycle',
      entityType: 'Event',
      entityId: id,
      before: { lifecycle: before.lifecycle },
      after: { lifecycle },
    });
    return updated;
  }

  async delete(id: string, ctx: AuditContext) {
    const before = await this.get(id);
    await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DRAFT' },
    });
    await this.audit.record({
      ...ctx,
      action: 'event.delete',
      entityType: 'Event',
      entityId: id,
      before: { slug: before.slug, title: before.title },
    });
  }

  private async assertMedia(mediaId?: string): Promise<void> {
    if (!mediaId) return;
    const found = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null },
      select: { id: true },
    });
    if (!found) throw new BadRequestException('Referenced media does not exist');
  }

  private async assertMediaList(
    list?: EventMediaInputDto[],
  ): Promise<void> {
    if (!list?.length) return;
    const ids = [
      ...new Set(
        list.flatMap((m) =>
          [m.mediaId, m.posterMediaId].filter(Boolean),
        ) as string[],
      ),
    ];
    const found = await this.prisma.media.count({
      where: { id: { in: ids }, deletedAt: null },
    });
    if (found !== ids.length) {
      throw new BadRequestException('One or more referenced media do not exist');
    }
  }
}
