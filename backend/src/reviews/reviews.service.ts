import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Review } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { paginate, type PaginationQuery } from '../common/pagination';
import type {
  AdminCreateReviewDto,
  CreateReviewDto,
  ReviewQueryDto,
} from './dto';

/** Fields safe to expose on the public site. */
export interface PublicReview {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  comment: string;
  createdAt: Date;
}

function toPublic(row: Review): PublicReview {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------------- public ----------------

  /** Anyone can submit; it is never visible until an admin approves + publishes. */
  async submitPublic(dto: CreateReviewDto, meta: { ip?: string | null }) {
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
      },
    });

    await this.notifyCreated(row);

    return { status: row.status };
  }

  /** Approved + published reviews, newest first. For a future "/reviews" page. */
  async publicList(query: PaginationQuery) {
    const where: Prisma.ReviewWhereInput = {
      status: 'APPROVED',
      isPublished: true,
      deletedAt: null,
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: [{ moderatedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);
    return paginate(rows.map(toPublic), total, query.page, query.pageSize);
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
      take: Math.min(Math.max(limit, 1), 24),
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
      }),
      this.prisma.review.count({ where }),
    ]);

    return paginate(rows, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const row = await this.prisma.review.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Review not found');
    return row;
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
    try {
      await this.prisma.notification.create({
        data: {
          type: 'REVIEW_CREATED',
          title: 'New review submitted',
          message: `${row.name} · ${row.rating}★`,
          entityType: 'Review',
          entityId: row.id,
        },
      });
    } catch {
      // A dropped notification must not fail the guest's submission.
    }
  }
}
