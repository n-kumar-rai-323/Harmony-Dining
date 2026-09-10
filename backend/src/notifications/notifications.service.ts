import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination';
import type { NotificationQueryDto } from './dto';

export interface EmitInput {
  type: NotificationType;
  title: string;
  message?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a global in-app notification. Best-effort: a dropped notification
   * must never fail the business operation that triggered it.
   */
  async emit(input: EmitInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          type: input.type,
          title: input.title,
          message: input.message ?? null,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to emit ${input.type} notification`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Paginated feed for one admin, annotated with that admin's read state. */
  async list(adminUserId: string, query: NotificationQueryDto) {
    const unreadOnly = query.unreadOnly === 'true';
    const where: Prisma.NotificationWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(unreadOnly ? { reads: { none: { adminUserId } } } : {}),
    };

    const [rows, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          reads: { where: { adminUserId }, select: { readAt: true } },
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { reads: { none: { adminUserId } } },
      }),
    ]);

    const items = rows.map(({ reads, ...n }) => ({
      ...n,
      read: reads.length > 0,
      readAt: reads[0]?.readAt ?? null,
    }));

    return { ...paginate(items, total, query.page, query.pageSize), unreadCount };
  }

  async unreadCount(adminUserId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notification.count({
      where: { reads: { none: { adminUserId } } },
    });
    return { unreadCount };
  }

  async markRead(
    adminUserId: string,
    id: string,
  ): Promise<{ id: string; read: true }> {
    const exists = await this.prisma.notification.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Notification not found');

    await this.prisma.notificationRead.upsert({
      where: {
        notificationId_adminUserId: { notificationId: id, adminUserId },
      },
      update: {},
      create: { notificationId: id, adminUserId },
    });
    return { id, read: true };
  }

  async markAllRead(adminUserId: string): Promise<{ marked: number }> {
    const unread = await this.prisma.notification.findMany({
      where: { reads: { none: { adminUserId } } },
      select: { id: true },
    });
    if (unread.length > 0) {
      await this.prisma.notificationRead.createMany({
        data: unread.map((n) => ({ notificationId: n.id, adminUserId })),
        skipDuplicates: true,
      });
    }
    return { marked: unread.length };
  }
}
