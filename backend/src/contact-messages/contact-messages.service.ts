import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from '../common/pagination';
import type { ContactMessageQueryDto, CreateContactMessageDto } from './dto';

@Injectable()
export class ContactMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- public ----------------

  async submitPublic(dto: CreateContactMessageDto, meta: { ip?: string | null }) {
    const row = await this.prisma.contactMessage.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone?.trim() || null,
        subject: dto.subject?.trim() || null,
        message: dto.message,
        ip: meta.ip ?? null,
      },
    });

    const snippet = row.message.length > 60 ? `${row.message.slice(0, 60)}…` : row.message;
    await this.notifications.emit({
      type: 'CONTACT_MESSAGE_CREATED',
      title: 'New contact message',
      message: `${row.fullName}${row.subject ? ` · ${row.subject}` : ''} · ${snippet}`,
      entityType: 'ContactMessage',
      entityId: row.id,
    });

    return { id: row.id };
  }

  // ---------------- admin ----------------

  async list(query: ContactMessageQueryDto) {
    const where: Prisma.ContactMessageWhereInput = {
      deletedAt: null,
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
              { message: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return paginate(rows, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const row = await this.prisma.contactMessage.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Message not found');
    return row;
  }

  async setRead(id: string, value: boolean, ctx: AuditContext) {
    const current = await this.get(id);
    if (current.isRead === value) return current;

    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: value
        ? { isRead: true, readById: ctx.actorId ?? null, readAt: new Date() }
        : { isRead: false, readById: null, readAt: null },
    });

    await this.audit.record({
      ...ctx,
      action: value ? 'message.read' : 'message.unread',
      entityType: 'ContactMessage',
      entityId: id,
    });

    return updated;
  }

  async softDelete(id: string, ctx: AuditContext) {
    await this.get(id);
    await this.prisma.contactMessage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.record({
      ...ctx,
      action: 'message.delete',
      entityType: 'ContactMessage',
      entityId: id,
    });
  }
}
