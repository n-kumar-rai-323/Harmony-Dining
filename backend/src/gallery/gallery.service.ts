import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { paginate } from '../common/pagination';
import type { ReorderDto } from '../menu/dto';
import type {
  CreateGalleryItemDto,
  GalleryQueryDto,
  UpdateGalleryItemDto,
} from './dto';

const INCLUDE = {
  media: {
    select: {
      id: true,
      url: true,
      width: true,
      height: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.GalleryItemInclude;

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: GalleryQueryDto) {
    const where: Prisma.GalleryItemWhereInput = {
      deletedAt: null,
      ...(query.category ? { category: query.category } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.galleryItem.findMany({
        where,
        include: INCLUDE,
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.galleryItem.count({ where }),
    ]);
    return paginate(items, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const item = await this.prisma.galleryItem.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE,
    });
    if (!item) throw new NotFoundException('Gallery item not found');
    return item;
  }

  async create(dto: CreateGalleryItemDto, ctx: AuditContext) {
    await this.assertMedia(dto.mediaId);
    const created = await this.prisma.galleryItem.create({
      data: {
        mediaId: dto.mediaId,
        title: dto.title.trim(),
        altText: dto.altText.trim(),
        caption: dto.caption?.trim() || null,
        category: dto.category,
        sortOrder: dto.sortOrder ?? 0,
        featuredOnHome: dto.featuredOnHome ?? false,
      },
      include: INCLUDE,
    });
    await this.audit.record({
      ...ctx,
      action: 'gallery_item.create',
      entityType: 'GalleryItem',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async update(id: string, dto: UpdateGalleryItemDto, ctx: AuditContext) {
    const before = await this.get(id);
    if (dto.mediaId && dto.mediaId !== before.mediaId) {
      await this.assertMedia(dto.mediaId);
    }
    const updated = await this.prisma.galleryItem.update({
      where: { id },
      data: {
        mediaId: dto.mediaId,
        title: dto.title?.trim(),
        altText: dto.altText?.trim(),
        caption:
          dto.caption === undefined ? undefined : dto.caption.trim() || null,
        category: dto.category,
        sortOrder: dto.sortOrder,
        featuredOnHome: dto.featuredOnHome,
      },
      include: INCLUDE,
    });
    await this.audit.record({
      ...ctx,
      action: 'gallery_item.update',
      entityType: 'GalleryItem',
      entityId: id,
      before,
      after: updated,
    });
    return updated;
  }

  async setStatus(id: string, status: PublishStatus, ctx: AuditContext) {
    const before = await this.get(id);
    if (before.status === status) return before;
    const updated = await this.prisma.galleryItem.update({
      where: { id },
      data: { status },
      include: INCLUDE,
    });
    await this.audit.record({
      ...ctx,
      action: `gallery_item.${status === 'PUBLISHED' ? 'publish' : 'unpublish'}`,
      entityType: 'GalleryItem',
      entityId: id,
      before: { status: before.status },
      after: { status },
    });
    return updated;
  }

  async reorder(dto: ReorderDto, ctx: AuditContext) {
    await this.prisma.$transaction(
      dto.items.map((e) =>
        this.prisma.galleryItem.update({
          where: { id: e.id },
          data: { sortOrder: e.sortOrder },
        }),
      ),
    );
    await this.audit.record({
      ...ctx,
      action: 'gallery_item.reorder',
      entityType: 'GalleryItem',
      after: { order: dto.items },
    });
  }

  async delete(id: string, ctx: AuditContext) {
    const before = await this.get(id);
    await this.prisma.galleryItem.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DRAFT', featuredOnHome: false },
    });
    await this.audit.record({
      ...ctx,
      action: 'gallery_item.delete',
      entityType: 'GalleryItem',
      entityId: id,
      before: { title: before.title, category: before.category },
    });
  }

  private async assertMedia(mediaId: string): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null },
      select: { id: true },
    });
    if (!media) {
      throw new BadRequestException('Referenced media does not exist');
    }
  }
}
