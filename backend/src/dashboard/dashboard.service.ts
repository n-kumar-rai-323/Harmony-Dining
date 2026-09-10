import { Injectable } from '@nestjs/common';
import {
  EnquiryStatus,
  ReservationStatus,
  ReviewStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const RESERVATION_ACTIVE: ReservationStatus[] = ['PENDING', 'CONFIRMED'];
const ENQUIRY_OPEN: EnquiryStatus[] = ['NEW', 'CONTACTED', 'PENDING'];
const ENQUIRY_CLOSED: EnquiryStatus[] = ['REJECTED', 'CANCELLED', 'COMPLETED'];

function zeroFill<K extends string>(
  keys: readonly K[],
  rows: { status: K; _count: { status: number } }[],
): Record<K, number> {
  const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
  for (const r of rows) out[r.status] = r._count.status;
  return out;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getSummary(adminUserId: string) {
    const now = new Date();
    const today = new Date(now.toISOString().slice(0, 10)); // midnight UTC
    const since = (days: number) =>
      new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const last7 = since(7);
    const last30 = since(30);
    const last1 = since(1);

    const [
      resByStatus,
      resUpcoming,
      resToday,
      res7,
      res30,
      enqByStatus,
      enqUpcoming,
      enq7,
      enq30,
      revByStatus,
      revPublished,
      revFeatured,
      revRatingAgg,
      rev7,
      rev30,
      menuItemsTotal,
      menuItemsPublished,
      menuCatsTotal,
      menuCatsPublished,
      galleryTotal,
      galleryPublished,
      eventsTotal,
      eventsUpcoming,
      auditLast24h,
      recentAudit,
    ] = await this.prisma.$transaction([
      this.prisma.reservation.groupBy({
        by: ['status'],
        _count: { status: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.reservation.count({
        where: { date: { gte: today }, status: { in: RESERVATION_ACTIVE } },
      }),
      this.prisma.reservation.count({
        where: { date: today, status: { in: RESERVATION_ACTIVE } },
      }),
      this.prisma.reservation.count({ where: { createdAt: { gte: last7 } } }),
      this.prisma.reservation.count({ where: { createdAt: { gte: last30 } } }),

      this.prisma.eventEnquiry.groupBy({
        by: ['status'],
        _count: { status: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.eventEnquiry.count({
        where: {
          preferredDate: { gte: today },
          status: { notIn: ENQUIRY_CLOSED },
        },
      }),
      this.prisma.eventEnquiry.count({ where: { createdAt: { gte: last7 } } }),
      this.prisma.eventEnquiry.count({ where: { createdAt: { gte: last30 } } }),

      this.prisma.review.groupBy({
        by: ['status'],
        _count: { status: true },
        orderBy: { status: 'asc' },
        where: { deletedAt: null },
      }),
      this.prisma.review.count({
        where: { deletedAt: null, isPublished: true },
      }),
      this.prisma.review.count({
        where: { deletedAt: null, isFeatured: true },
      }),
      this.prisma.review.aggregate({
        _avg: { rating: true },
        where: { deletedAt: null, status: 'APPROVED', isPublished: true },
      }),
      this.prisma.review.count({
        where: { deletedAt: null, createdAt: { gte: last7 } },
      }),
      this.prisma.review.count({
        where: { deletedAt: null, createdAt: { gte: last30 } },
      }),

      this.prisma.menuItem.count({ where: { deletedAt: null } }),
      this.prisma.menuItem.count({
        where: { deletedAt: null, status: 'PUBLISHED' },
      }),
      this.prisma.menuCategory.count({ where: { deletedAt: null } }),
      this.prisma.menuCategory.count({
        where: { deletedAt: null, status: 'PUBLISHED' },
      }),
      this.prisma.galleryItem.count({ where: { deletedAt: null } }),
      this.prisma.galleryItem.count({
        where: { deletedAt: null, status: 'PUBLISHED' },
      }),
      this.prisma.event.count({ where: { deletedAt: null } }),
      this.prisma.event.count({
        where: { deletedAt: null, lifecycle: 'UPCOMING' },
      }),

      this.prisma.auditLog.count({ where: { createdAt: { gte: last1 } } }),
      this.prisma.auditLog.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 8,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          actorEmail: true,
          createdAt: true,
        },
      }),
    ]);

    const { unreadCount } = await this.notifications.unreadCount(adminUserId);

    type StatusCount<K extends string> = { status: K; _count: { status: number } };
    const reservationsByStatus = zeroFill(
      Object.values(ReservationStatus),
      resByStatus as StatusCount<ReservationStatus>[],
    );
    const enquiriesByStatus = zeroFill(
      Object.values(EnquiryStatus),
      enqByStatus as StatusCount<EnquiryStatus>[],
    );
    const reviewsByStatus = zeroFill(
      Object.values(ReviewStatus),
      revByStatus as StatusCount<ReviewStatus>[],
    );

    const avg = revRatingAgg._avg.rating;

    return {
      generatedAt: now.toISOString(),
      reservations: {
        byStatus: reservationsByStatus,
        pending: reservationsByStatus.PENDING,
        upcoming: resUpcoming,
        today: resToday,
        last7Days: res7,
        last30Days: res30,
      },
      enquiries: {
        byStatus: enquiriesByStatus,
        open: ENQUIRY_OPEN.reduce((n, s) => n + enquiriesByStatus[s], 0),
        upcoming: enqUpcoming,
        last7Days: enq7,
        last30Days: enq30,
      },
      reviews: {
        byStatus: reviewsByStatus,
        pendingModeration: reviewsByStatus.PENDING,
        published: revPublished,
        featured: revFeatured,
        averageRating: avg === null ? null : Math.round(avg * 100) / 100,
        last7Days: rev7,
        last30Days: rev30,
      },
      content: {
        menuItems: { total: menuItemsTotal, published: menuItemsPublished },
        menuCategories: { total: menuCatsTotal, published: menuCatsPublished },
        galleryItems: { total: galleryTotal, published: galleryPublished },
        events: { total: eventsTotal, upcoming: eventsUpcoming },
      },
      notifications: { unread: unreadCount },
      activity: { auditLast24h, recentAudit },
    };
  }
}
