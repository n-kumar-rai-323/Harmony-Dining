import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { StorageDriver } from '../storage/storage.types';
import { paginate } from '../common/pagination';
import {
  buildStorageKey,
  validateImage,
} from './image-validation';
import type { MediaQueryDto, UpdateMediaDto, UploadMediaDto } from './dto';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly audit: AuditService,
  ) {}

  async upload(file: UploadedFile, dto: UploadMediaDto, ctx: AuditContext) {
    const img = await validateImage(file.buffer);
    const key = buildStorageKey(
      dto.folder ?? 'general',
      file.originalname || 'image',
      img.ext,
      randomBytes(8).toString('hex'),
    );

    const stored = await this.storage.put(key, file.buffer, img.mime);

    const media = await this.prisma.media.create({
      data: {
        storageKey: stored.key,
        url: stored.url,
        mimeType: img.mime,
        sizeBytes: img.sizeBytes,
        width: img.width,
        height: img.height,
        originalFilename: (file.originalname || 'image').slice(0, 255),
        folder: dto.folder?.trim() || 'general',
        altText: dto.altText?.trim() || null,
        title: dto.title?.trim() || null,
        caption: dto.caption?.trim() || null,
        uploadedById: ctx.actorId ?? null,
      },
    });

    await this.audit.record({
      ...ctx,
      action: 'media.upload',
      entityType: 'Media',
      entityId: media.id,
      after: {
        storageKey: media.storageKey,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
      },
    });
    return media;
  }

  async list(query: MediaQueryDto) {
    const where: Prisma.MediaWhereInput = {
      deletedAt: null,
      ...(query.folder ? { folder: query.folder } : {}),
      ...(query.search
        ? {
            OR: [
              {
                originalFilename: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              { title: { contains: query.search, mode: 'insensitive' } },
              { altText: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.media.count({ where }),
    ]);
    return paginate(items, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });
    if (!media) throw new NotFoundException('Media not found');
    const references = await this.countReferences(id);
    return { ...media, references, referenceCount: sum(references) };
  }

  async update(id: string, dto: UpdateMediaDto, ctx: AuditContext) {
    const before = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new NotFoundException('Media not found');

    const updated = await this.prisma.media.update({
      where: { id },
      data: {
        altText:
          dto.altText === undefined ? undefined : dto.altText.trim() || null,
        title: dto.title === undefined ? undefined : dto.title.trim() || null,
        caption:
          dto.caption === undefined ? undefined : dto.caption.trim() || null,
        folder: dto.folder?.trim() || undefined,
      },
    });
    await this.audit.record({
      ...ctx,
      action: 'media.update',
      entityType: 'Media',
      entityId: id,
      before: {
        altText: before.altText,
        title: before.title,
        caption: before.caption,
        folder: before.folder,
      },
      after: {
        altText: updated.altText,
        title: updated.title,
        caption: updated.caption,
        folder: updated.folder,
      },
    });
    return updated;
  }

  async delete(id: string, ctx: AuditContext) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });
    if (!media) throw new NotFoundException('Media not found');

    const references = await this.countReferences(id);
    if (sum(references) > 0) {
      throw new ConflictException({
        message:
          'This media is still used by other content. Replace it there first.',
        references,
      });
    }

    await this.storage.delete(media.storageKey);
    await this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.record({
      ...ctx,
      action: 'media.delete',
      entityType: 'Media',
      entityId: id,
      before: { storageKey: media.storageKey },
    });
  }

  private async countReferences(mediaId: string) {
    const [menuItems, galleryItems, eventCovers, eventMedia, eventPosters] =
      await this.prisma.$transaction([
        this.prisma.menuItem.count({ where: { mediaId, deletedAt: null } }),
        this.prisma.galleryItem.count({ where: { mediaId, deletedAt: null } }),
        this.prisma.event.count({
          where: { coverMediaId: mediaId, deletedAt: null },
        }),
        this.prisma.eventMedia.count({ where: { mediaId } }),
        this.prisma.eventMedia.count({ where: { posterMediaId: mediaId } }),
      ]);
    return { menuItems, galleryItems, eventCovers, eventMedia, eventPosters };
  }
}

function sum(obj: Record<string, number>): number {
  return Object.values(obj).reduce((a, b) => a + b, 0);
}
