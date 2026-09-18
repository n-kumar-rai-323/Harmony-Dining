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
    const prev7 = since(14);
    const last30 = since(30);
    const last1 = since(1);
    const next7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      resByStatus,
      resUpcoming,
      resToday,
      res7,
      res30,
      resPrev7,
      oldestPending,
      enqByStatus,
      enqUpcoming,
      enqWithin7,
      enq7,
      enq30,
      enqPrev7,
      revByStatus,
      revPublished,
      revFeatured,
      revRatingAgg,
      rev7,
      rev30,
      revPrev7,
      latestPendingReview,
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
      recentNotifications,
      recentEntityAudit,
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
      this.prisma.reservation.count({
        where: { createdAt: { gte: prev7, lt: last7 } },
      }),
      this.prisma.reservation.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),

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
      this.prisma.eventEnquiry.count({
        where: {
          preferredDate: { gte: today, lte: next7 },
          status: { notIn: ENQUIRY_CLOSED },
        },
      }),
      this.prisma.eventEnquiry.count({ where: { createdAt: { gte: last7 } } }),
      this.prisma.eventEnquiry.count({ where: { createdAt: { gte: last30 } } }),
      this.prisma.eventEnquiry.count({
        where: { createdAt: { gte: prev7, lt: last7 } },
      }),

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
      this.prisma.review.count({
        where: { deletedAt: null, createdAt: { gte: prev7, lt: last7 } },
      }),
      this.prisma.review.findFirst({
        where: { deletedAt: null, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        select: { rating: true, name: true },
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
          before: true,
          after: true,
          createdAt: true,
          actor: { select: { name: true } },
        },
      }),
      this.prisma.notification.findMany({
        where: { type: { in: ['RESERVATION_CREATED', 'ENQUIRY_CREATED', 'REVIEW_CREATED'] } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10,
        select: { id: true, type: true, message: true, createdAt: true },
      }),
      this.prisma.auditLog.findMany({
        where: { entityType: { in: ['MenuItem', 'GalleryItem'] } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10,
        select: {
          id: true,
          action: true,
          entityType: true,
          before: true,
          after: true,
          createdAt: true,
          actor: { select: { name: true } },
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
    const oldestPendingHours = oldestPending
      ? Math.max(0, Math.round((now.getTime() - oldestPending.createdAt.getTime()) / 3600000))
      : null;

    return {
      generatedAt: now.toISOString(),
      reservations: {
        byStatus: reservationsByStatus,
        pending: reservationsByStatus.PENDING,
        upcoming: resUpcoming,
        today: resToday,
        last7Days: res7,
        last30Days: res30,
        previous7Days: resPrev7,
        oldestPendingHours,
      },
      enquiries: {
        byStatus: enquiriesByStatus,
        open: ENQUIRY_OPEN.reduce((n, s) => n + enquiriesByStatus[s], 0),
        upcoming: enqUpcoming,
        upcomingWithin7Days: enqWithin7,
        last7Days: enq7,
        last30Days: enq30,
        previous7Days: enqPrev7,
      },
      reviews: {
        byStatus: reviewsByStatus,
        pendingModeration: reviewsByStatus.PENDING,
        published: revPublished,
        featured: revFeatured,
        averageRating: avg === null ? null : Math.round(avg * 100) / 100,
        last7Days: rev7,
        last30Days: rev30,
        previous7Days: revPrev7,
        latestPending: latestPendingReview,
      },
      content: {
        menuItems: { total: menuItemsTotal, published: menuItemsPublished },
        menuCategories: { total: menuCatsTotal, published: menuCatsPublished },
        galleryItems: { total: galleryTotal, published: galleryPublished },
        events: { total: eventsTotal, upcoming: eventsUpcoming },
      },
      notifications: { unread: unreadCount },
      activity: {
        auditLast24h,
        recentAudit,
        feed: buildActivityFeed(recentNotifications, recentEntityAudit),
      },
    };
  }
}

export interface ActivityFeedItem {
  id: string;
  kind: 'reservation' | 'enquiry' | 'review' | 'menu' | 'gallery';
  title: string;
  context: string | null;
  actorName: string | null;
  createdAt: Date;
  actionLabel: string;
  actionHref: string;
}

type FeedNotification = {
  id: string;
  type: string;
  message: string | null;
  createdAt: Date;
};

type FeedAuditRow = {
  id: string;
  action: string;
  entityType: string;
  before: unknown;
  after: unknown;
  createdAt: Date;
  actor: { name: string } | null;
};

/** Turns a raw notification message ("A · B · C") into its parts. */
function parts(message: string | null): string[] {
  return (message ?? '').split(' · ').map((s) => s.trim());
}

function notificationToFeedItem(n: FeedNotification): ActivityFeedItem | null {
  const p = parts(n.message);
  if (n.type === 'RESERVATION_CREATED') {
    return {
      id: n.id,
      kind: 'reservation',
      title: `${p[0] || 'A guest'} booked a table`,
      context: [p[1], p[2]].filter(Boolean).join(' · ') || null,
      actorName: null,
      createdAt: n.createdAt,
      actionLabel: 'View',
      actionHref: '/admin/reservations',
    };
  }
  if (n.type === 'ENQUIRY_CREATED') {
    return {
      id: n.id,
      kind: 'enquiry',
      title: `New enquiry from ${p[0] || 'a guest'}`,
      context: [p[1], p[2], p[3]].filter(Boolean).join(' · ') || null,
      actorName: null,
      createdAt: n.createdAt,
      actionLabel: 'View',
      actionHref: '/admin/enquiries',
    };
  }
  if (n.type === 'REVIEW_CREATED') {
    return {
      id: n.id,
      kind: 'review',
      title: `${p[0] || 'A guest'} left a ${p[1] || '?'} review`,
      context: p[2] ? `"${p[2]}"` : null,
      actorName: null,
      createdAt: n.createdAt,
      actionLabel: 'Approve',
      actionHref: '/admin/reviews',
    };
  }
  return null;
}

function auditRowToFeedItem(row: FeedAuditRow): ActivityFeedItem | null {
  const after = row.after && typeof row.after === 'object' ? (row.after as Record<string, unknown>) : {};
  const before = row.before && typeof row.before === 'object' ? (row.before as Record<string, unknown>) : {};
  const actorName = row.actor?.name ?? null;

  if (row.entityType === 'MenuItem') {
    const name = typeof after.name === 'string' ? after.name : 'A menu item';
    if (
      row.action === 'menu_item.update' &&
      typeof after.isAvailable === 'boolean' &&
      before.isAvailable !== after.isAvailable
    ) {
      return {
        id: row.id,
        kind: 'menu',
        title: `"${name}" marked ${after.isAvailable ? 'back in stock' : 'out of stock'}`,
        context: actorName ? `by ${actorName}` : null,
        actorName,
        createdAt: row.createdAt,
        actionLabel: 'Review',
        actionHref: '/admin/menu',
      };
    }
    if (row.action === 'menu_item.create') {
      return {
        id: row.id,
        kind: 'menu',
        title: `"${name}" added to the menu`,
        context: actorName ? `by ${actorName}` : null,
        actorName,
        createdAt: row.createdAt,
        actionLabel: 'View',
        actionHref: '/admin/menu',
      };
    }
    return null;
  }

  if (row.entityType === 'GalleryItem' && row.action === 'gallery_item.create') {
    const title = typeof after.title === 'string' ? after.title : 'A photo';
    const category = typeof after.category === 'string' ? after.category : null;
    return {
      id: row.id,
      kind: 'gallery',
      title: `"${title}" uploaded to Gallery`,
      context: [actorName ? `by ${actorName}` : null, category ? `${category} category` : null]
        .filter(Boolean)
        .join(' · ') || null,
      actorName,
      createdAt: row.createdAt,
      actionLabel: 'View',
      actionHref: '/admin/gallery',
    };
  }

  return null;
}

/** Merges recent customer notifications + admin audit rows into one feed, newest first. */
function buildActivityFeed(
  notifications: FeedNotification[],
  auditRows: FeedAuditRow[],
): ActivityFeedItem[] {
  const items = [
    ...notifications.map(notificationToFeedItem),
    ...auditRows.map(auditRowToFeedItem),
  ].filter((i): i is ActivityFeedItem => i !== null);

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, 12);
}
