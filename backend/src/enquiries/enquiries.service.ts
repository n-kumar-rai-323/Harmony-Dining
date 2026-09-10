import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  EnquiryStatus,
  type EventEnquiry,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from '../common/pagination';
import type {
  CreateEventEnquiryDto,
  EnquiryQueryDto,
} from './dto';

// A staff member can move an enquiry along these paths only.
const ALLOWED_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ['CONTACTED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  CONTACTED: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  PENDING: ['CONTACTED', 'APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export interface DateConflict {
  date: string;
  events: { id: string; title: string; slug: string }[];
  approvedEnquiries: { id: string; reference: string; eventType: string }[];
}

function serialize(row: EventEnquiry) {
  return {
    ...row,
    preferredDate: toDateString(row.preferredDate),
    alternativeDate: row.alternativeDate
      ? toDateString(row.alternativeDate)
      : null,
    budget: row.budget ? Number(row.budget) : null,
  };
}

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- public ----------------

  async create(dto: CreateEventEnquiryDto, meta: { ip?: string | null }) {
    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.eventEnquiry.create({
        data: {
          reference: await uniqueReference(tx, dto.preferredDate),
          fullName: dto.fullName.trim(),
          phone: dto.phone,
          email: dto.email?.trim() || null,
          eventType: dto.eventType.trim(),
          preferredDate: new Date(dto.preferredDate),
          alternativeDate: dto.alternativeDate
            ? new Date(dto.alternativeDate)
            : null,
          startTime: dto.startTime ?? null,
          endTime: dto.endTime ?? null,
          guests: dto.guests,
          budget: dto.budget ? new Prisma.Decimal(dto.budget) : null,
          requirements: dto.requirements?.trim() || null,
          status: 'NEW',
          ip: meta.ip ?? null,
        },
      });
      await tx.eventEnquiryStatusHistory.create({
        data: {
          enquiryId: row.id,
          toStatus: 'NEW',
          note: 'Submitted from the website',
        },
      });
      return row;
    });

    await this.notifyCreated(created);

    return {
      reference: created.reference,
      status: created.status,
      preferredDate: toDateString(created.preferredDate),
    };
  }

  // ---------------- admin ----------------

  async list(query: EnquiryQueryDto) {
    const where: Prisma.EventEnquiryWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            preferredDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
              { reference: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { eventType: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.eventEnquiry.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.eventEnquiry.count({ where }),
    ]);

    // One batched conflict lookup for every date on the page.
    const dates = new Set<string>();
    for (const r of rows) {
      dates.add(toDateString(r.preferredDate));
      if (r.alternativeDate) dates.add(toDateString(r.alternativeDate));
    }
    const conflicts = await this.conflictsForDates([...dates]);

    const items = rows.map((r) => {
      const pref = conflicts.get(toDateString(r.preferredDate));
      const alt = r.alternativeDate
        ? conflicts.get(toDateString(r.alternativeDate))
        : undefined;
      return {
        ...serialize(r),
        hasConflict: hasAny(pref, r.id) || hasAny(alt, r.id),
      };
    });

    return paginate(items, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const row = await this.prisma.eventEnquiry.findUnique({
      where: { id },
      include: { history: { orderBy: { createdAt: 'asc' } } },
    });
    if (!row) throw new NotFoundException('Enquiry not found');

    const dates = [toDateString(row.preferredDate)];
    if (row.alternativeDate) dates.push(toDateString(row.alternativeDate));
    const conflicts = await this.conflictsForDates(dates, id);

    return {
      ...serialize(row),
      history: row.history,
      conflicts: {
        preferred: conflicts.get(toDateString(row.preferredDate)) ?? null,
        alternative: row.alternativeDate
          ? (conflicts.get(toDateString(row.alternativeDate)) ?? null)
          : null,
      },
    };
  }

  async setStatus(
    id: string,
    toStatus: EnquiryStatus,
    note: string | undefined,
    ctx: AuditContext,
  ) {
    const current = await this.prisma.eventEnquiry.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Enquiry not found');

    if (toStatus === current.status) {
      throw new BadRequestException(`Enquiry is already ${toStatus}.`);
    }
    if (!ALLOWED_TRANSITIONS[current.status].includes(toStatus)) {
      throw new BadRequestException(
        `Cannot move a ${current.status} enquiry to ${toStatus}.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.eventEnquiry.update({
        where: { id },
        data: { status: toStatus, handledById: ctx.actorId ?? null },
      });
      await tx.eventEnquiryStatusHistory.create({
        data: {
          enquiryId: id,
          fromStatus: current.status,
          toStatus,
          changedById: ctx.actorId ?? null,
          note: note?.trim() || null,
        },
      });
      return row;
    });

    await this.audit.record({
      ...ctx,
      action: `enquiry.${toStatus.toLowerCase()}`,
      entityType: 'EventEnquiry',
      entityId: id,
      before: { status: current.status },
      after: { status: toStatus },
    });

    return serialize(updated);
  }

  /** Published events and approved enquiries clashing with a date. */
  async conflictsFor(date: string): Promise<DateConflict> {
    const map = await this.conflictsForDates([date]);
    return (
      map.get(date) ?? { date, events: [], approvedEnquiries: [] }
    );
  }

  // ---------------- internals ----------------

  private async conflictsForDates(
    dates: string[],
    excludeEnquiryId?: string,
  ): Promise<Map<string, DateConflict>> {
    const result = new Map<string, DateConflict>();
    if (dates.length === 0) return result;

    const asDates = dates.map((d) => new Date(d));
    const [events, approved] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where: {
          eventDate: { in: asDates },
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: { id: true, title: true, slug: true, eventDate: true },
      }),
      this.prisma.eventEnquiry.findMany({
        where: {
          preferredDate: { in: asDates },
          status: 'APPROVED',
          ...(excludeEnquiryId ? { id: { not: excludeEnquiryId } } : {}),
        },
        select: {
          id: true,
          reference: true,
          eventType: true,
          preferredDate: true,
        },
      }),
    ]);

    for (const d of dates) {
      result.set(d, { date: d, events: [], approvedEnquiries: [] });
    }
    for (const e of events) {
      result.get(toDateString(e.eventDate))?.events.push({
        id: e.id,
        title: e.title,
        slug: e.slug,
      });
    }
    for (const q of approved) {
      result.get(toDateString(q.preferredDate))?.approvedEnquiries.push({
        id: q.id,
        reference: q.reference,
        eventType: q.eventType,
      });
    }
    return result;
  }

  private async notifyCreated(row: EventEnquiry): Promise<void> {
    await this.notifications.emit({
      type: 'ENQUIRY_CREATED',
      title: 'New private event enquiry',
      message: `${row.fullName} · ${row.eventType} · ${toDateString(
        row.preferredDate,
      )} · ${row.guests} guests`,
      entityType: 'EventEnquiry',
      entityId: row.id,
    });
  }
}

// ---------------- helpers ----------------

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function hasAny(c: DateConflict | undefined, selfId: string): boolean {
  if (!c) return false;
  return (
    c.events.length > 0 ||
    c.approvedEnquiries.some((q) => q.id !== selfId)
  );
}

async function uniqueReference(
  tx: Prisma.TransactionClient,
  dateStr: string,
): Promise<string> {
  const datePart = dateStr.replace(/-/g, '').slice(2); // YYMMDD
  for (let i = 0; i < 6; i += 1) {
    const rand = randomBytes(3)
      .toString('base64')
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .slice(0, 4)
      .padEnd(4, 'X');
    const ref = `EVT-${datePart}-${rand}`;
    const exists = await tx.eventEnquiry.findUnique({ where: { reference: ref } });
    if (!exists) return ref;
  }
  return `EVT-${datePart}-${Date.now().toString(36).toUpperCase()}`;
}
