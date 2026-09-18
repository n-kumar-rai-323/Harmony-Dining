import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Review } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from '../common/pagination';
import type {
  AdminCreateReviewDto,
  CreateReviewDto,
  PublicReviewQueryDto,
  ReplyToReviewDto,
  ReviewQueryDto,
} from './dto';

export interface PublicReviewStats {
  total: number;
  average: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  topRoles: string[];
}

export interface ReviewPhotoSummary {
  id: string;
  url: string;
}

/** Fields safe to expose on the public site. */
export interface PublicReview {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  comment: string;
  createdAt: Date;
  photos: ReviewPhotoSummary[];
  reply: string | null;
  repliedAt: Date | null;
}

const PHOTOS_INCLUDE = {
  photos: {
    orderBy: { sortOrder: 'asc' as const },
    include: { media: { select: { id: true, url: true } } },
  },
};

type ReviewWithPhotos = Review & {
  photos: { media: { id: string; url: string } }[];
};

function toPublic(row: ReviewWithPhotos): PublicReview {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt,
    photos: row.photos.map((p) => ({ id: p.media.id, url: p.media.url })),
    reply: row.reply,
    repliedAt: row.repliedAt,
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- public ----------------

  /** Anyone can submit; it is never visible until an admin approves + publishes. */
  async submitPublic(dto: CreateReviewDto, meta: { ip?: string | null }) {
    const mediaIds = [...new Set(dto.mediaIds ?? [])].slice(0, 3);

    if (mediaIds.length > 0) {
      const found = await this.prisma.media.count({
        where: { id: { in: mediaIds }, deletedAt: null },
      });
      if (found !== mediaIds.length) {
        throw new BadRequestException('One or more photos could not be found.');
      }
    }

    const row = await this.prisma.review.create({
      data: {
        name: dto.name,
        rating: dto.rating,
        comment: dto.comment,
        role: dto.role?.trim() || null,
        status: 'PENDING',
        isPublished: false,
        source: 'WEBSITE',
        ip: meta.ip ?? null,
        ...(mediaIds.length > 0
          ? {
              photos: {
                create: mediaIds.map((mediaId, i) => ({ mediaId, sortOrder: i })),
              },
            }
          : {}),
      },
    });

    await this.notifyCreated(row);

    return { status: row.status };
  }

  /** Approved + published reviews for the /reviews page: filterable, sortable. */
  async publicList(query: PublicReviewQueryDto) {
    const where: Prisma.ReviewWhereInput = {
      status: 'APPROVED',
      isPublished: true,
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
    };
    const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
      query.sort === 'highest'
        ? [{ rating: 'desc' }, { createdAt: 'desc' }]
        : query.sort === 'lowest'
          ? [{ rating: 'asc' }, { createdAt: 'desc' }]
          : [{ moderatedAt: 'desc' }, { createdAt: 'desc' }];
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: PHOTOS_INCLUDE,
      }),
      this.prisma.review.count({ where }),
    ]);
    return paginate(rows.map(toPublic), total, query.page, query.pageSize);
  }

  /** Aggregate rating breakdown + top occasion labels, for the /reviews summary. */
  async publicStats(): Promise<PublicReviewStats> {
    const where: Prisma.ReviewWhereInput = {
      status: 'APPROVED',
      isPublished: true,
      deletedAt: null,
    };
    const [total, avgAgg, byRating, byRole] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({ where, _avg: { rating: true } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['role'],
        where: { ...where, role: { not: null } },
        _count: { role: true },
        orderBy: { _count: { role: 'desc' } },
        take: 6,
      }),
    ]);

    const breakdown: PublicReviewStats['breakdown'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of byRating) {
      const star = row.rating as 1 | 2 | 3 | 4 | 5;
      if (star >= 1 && star <= 5) breakdown[star] = row._count.rating;
    }

    return {
      total,
      average: Math.round((avgAgg._avg.rating ?? 0) * 10) / 10,
      breakdown,
      topRoles: byRole.map((r) => r.role).filter((r): r is string => Boolean(r)),
    };
  }

  /** Featured reviews for the homepage showcase. */
  async publicFeatured(limit: number): Promise<PublicReview[]> {
    const rows = await this.prisma.review.findMany({
      where: {
        status: 'APPROVED',
        isPublished: true,
        isFeatured: true,
        deletedAt: null,
      },
      orderBy: [{ moderatedAt: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 50),
      include: PHOTOS_INCLUDE,
    });
    return rows.map(toPublic);
  }

  // ---------------- admin ----------------

  async adminCreate(dto: AdminCreateReviewDto, ctx: AuditContext) {
    const approve = dto.approve === true;
    const feature = dto.feature === true;
    if (feature && !approve) {
      throw new BadRequestException('A featured review must also be approved.');
    }

    const mediaIds = [...new Set(dto.mediaIds ?? [])].slice(0, 3);
    if (mediaIds.length > 0) {
      const found = await this.prisma.media.count({
        where: { id: { in: mediaIds }, deletedAt: null },
      });
      if (found !== mediaIds.length) {
        throw new BadRequestException('One or more photos could not be found.');
      }
    }

    const row = await this.prisma.review.create({
      data: {
        name: dto.name,
        rating: dto.rating,
        comment: dto.comment,
        role: dto.role?.trim() || null,
        source: 'IMPORT',
        status: approve ? 'APPROVED' : 'PENDING',
        isPublished: approve,
        isFeatured: feature,
        moderatedById: approve ? (ctx.actorId ?? null) : null,
        moderatedAt: approve ? new Date() : null,
        ...(mediaIds.length > 0
          ? {
              photos: {
                create: mediaIds.map((mediaId, i) => ({ mediaId, sortOrder: i })),
              },
            }
          : {}),
      },
    });

    await this.audit.record({
      ...ctx,
      action: 'review.create',
      entityType: 'Review',
      entityId: row.id,
      after: { status: row.status, isPublished: row.isPublished, source: 'IMPORT' },
    });

    return row;
  }

  async list(query: ReviewQueryDto) {
    const where: Prisma.ReviewWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.published !== undefined ? { isPublished: query.published } : {}),
      ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { comment: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: PHOTOS_INCLUDE,
      }),
      this.prisma.review.count({ where }),
    ]);

    return paginate(
      rows.map((r) => ({ ...r, photos: r.photos.map((p) => ({ id: p.media.id, url: p.media.url })) })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async get(id: string) {
    const row = await this.prisma.review.findFirst({
      where: { id, deletedAt: null },
      include: PHOTOS_INCLUDE,
    });
    if (!row) throw new NotFoundException('Review not found');
    return { ...row, photos: row.photos.map((p) => ({ id: p.media.id, url: p.media.url })) };
  }

  async approve(id: string, ctx: AuditContext) {
    const current = await this.get(id);
    if (current.status === 'APPROVED') {
      throw new BadRequestException('Review is already approved.');
    }
    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        status: 'APPROVED',
        moderatedById: ctx.actorId ?? null,
        moderatedAt: new Date(),
      },
    });
    await this.record(ctx, 'review.approve', current, updated);
    return updated;
  }

  async reject(id: string, ctx: AuditContext) {
    const current = await this.get(id);
    if (current.status === 'REJECTED') {
      throw new BadRequestException('Review is already rejected.');
    }
    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        status: 'REJECTED',
        isPublished: false,
        isFeatured: false,
        moderatedById: ctx.actorId ?? null,
        moderatedAt: new Date(),
      },
    });
    await this.record(ctx, 'review.reject', current, updated);
    return updated;
  }

  async setPublished(id: string, value: boolean, ctx: AuditContext) {
    const current = await this.get(id);
    if (value && current.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only an approved review can be published.',
      );
    }
    if (current.isPublished === value) {
      throw new BadRequestException(
        `Review is already ${value ? 'published' : 'unpublished'}.`,
      );
    }
    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        isPublished: value,
        // An unpublished review cannot stay featured on the homepage.
        ...(value ? {} : { isFeatured: false }),
      },
    });
    await this.record(
      ctx,
      value ? 'review.publish' : 'review.unpublish',
      current,
      updated,
    );
    return updated;
  }

  async setFeatured(id: string, value: boolean, ctx: AuditContext) {
    const current = await this.get(id);
    if (value && (current.status !== 'APPROVED' || !current.isPublished)) {
      throw new BadRequestException(
        'Only an approved, published review can be featured.',
      );
    }
    if (current.isFeatured === value) {
      throw new BadRequestException(
        `Review is already ${value ? 'featured' : 'unfeatured'}.`,
      );
    }
    const updated = await this.prisma.review.update({
      where: { id },
      data: { isFeatured: value },
    });
    await this.record(
      ctx,
      value ? 'review.feature' : 'review.unfeature',
      current,
      updated,
    );
    return updated;
  }

  /** Sets (or clears, if blank) the admin's public reply to a review. */
  async reply(id: string, dto: ReplyToReviewDto, ctx: AuditContext) {
    const current = await this.get(id);
    const text = dto.reply.trim();
    const updated = await this.prisma.review.update({
      where: { id },
      data: text
        ? { reply: text, repliedById: ctx.actorId ?? null, repliedAt: new Date() }
        : { reply: null, repliedById: null, repliedAt: null },
    });
    await this.audit.record({
      ...ctx,
      action: text ? 'review.reply' : 'review.reply_clear',
      entityType: 'Review',
      entityId: id,
      before: { reply: current.reply },
      after: { reply: updated.reply },
    });
    return updated;
  }

  async softDelete(id: string, ctx: AuditContext) {
    const current = await this.get(id);
    await this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false, isFeatured: false },
    });
    await this.audit.record({
      ...ctx,
      action: 'review.delete',
      entityType: 'Review',
      entityId: id,
      before: { status: current.status, isPublished: current.isPublished },
    });
  }

  // ---------------- internals ----------------

  private async record(
    ctx: AuditContext,
    action: string,
    before: Review,
    after: Review,
  ): Promise<void> {
    await this.audit.record({
      ...ctx,
      action,
      entityType: 'Review',
      entityId: after.id,
      before: {
        status: before.status,
        isPublished: before.isPublished,
        isFeatured: before.isFeatured,
      },
      after: {
        status: after.status,
        isPublished: after.isPublished,
        isFeatured: after.isFeatured,
      },
    });
  }

  private async notifyCreated(row: Review): Promise<void> {
    const snippet = row.comment.length > 60 ? `${row.comment.slice(0, 60)}…` : row.comment;
    await this.notifications.emit({
      type: 'REVIEW_CREATED',
      title: 'New review submitted',
      message: `${row.name} · ${row.rating}★ · ${snippet}`,
      entityType: 'Review',
      entityId: row.id,
    });
  }
}
