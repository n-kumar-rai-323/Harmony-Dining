import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ReservationStatus,
  type NotificationType,
  type ReservationSettings,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate } from '../common/pagination';
import type {
  CreateReservationDto,
  DisabledDateDto,
  ReservationQueryDto,
  UpdateReservationSettingsDto,
} from './dto';

// Which statuses consume slot capacity.
const ACTIVE: ReservationStatus[] = ['PENDING', 'CONFIRMED'];

const ALLOWED_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export interface AvailabilitySlot {
  time: string;
  capacity: number;
  booked: number;
  remaining: number;
  available: boolean;
}
export interface AvailabilityResult {
  date: string;
  open: boolean;
  closedReason?: string;
  maxGuestsPerReservation: number;
  slots: AvailabilitySlot[];
}

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- settings ----------------

  async getSettings(): Promise<ReservationSettings> {
    return this.prisma.reservationSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });
  }

  async updateSettings(
    dto: UpdateReservationSettingsDto,
    ctx: AuditContext,
  ): Promise<ReservationSettings> {
    const before = await this.getSettings();
    const opening = dto.openingTime ?? before.openingTime;
    const closing = dto.closingTime ?? before.closingTime;
    if (toMinutes(opening) >= toMinutes(closing)) {
      throw new BadRequestException('Opening time must be before closing time');
    }
    const updated = await this.prisma.reservationSettings.update({
      where: { id: 'default' },
      data: { ...dto, updatedById: ctx.actorId ?? null },
    });
    await this.audit.record({
      ...ctx,
      action: 'reservation_settings.update',
      entityType: 'ReservationSettings',
      entityId: 'default',
      before,
      after: updated,
    });
    return updated;
  }

  listDisabledDates() {
    return this.prisma.disabledDate.findMany({ orderBy: { date: 'asc' } });
  }

  async addDisabledDate(dto: DisabledDateDto, ctx: AuditContext) {
    const row = await this.prisma.disabledDate.upsert({
      where: { date: new Date(dto.date) },
      update: { reason: dto.reason?.trim() || null },
      create: { date: new Date(dto.date), reason: dto.reason?.trim() || null },
    });
    await this.audit.record({
      ...ctx,
      action: 'reservation.disable_date',
      entityType: 'DisabledDate',
      entityId: row.id,
      after: { date: dto.date, reason: row.reason },
    });
    return row;
  }

  async removeDisabledDate(date: string, ctx: AuditContext) {
    await this.prisma.disabledDate
      .delete({ where: { date: new Date(date) } })
      .catch(() => {
        throw new NotFoundException('Date is not disabled');
      });
    await this.audit.record({
      ...ctx,
      action: 'reservation.enable_date',
      entityType: 'DisabledDate',
      after: { date },
    });
  }

  // ---------------- availability ----------------

  async getAvailability(date: string): Promise<AvailabilityResult> {
    const settings = await this.getSettings();
    const now = nowInTz(settings.timezone);

    const base: Omit<AvailabilityResult, 'slots' | 'open'> = {
      date,
      maxGuestsPerReservation: settings.maxGuestsPerReservation,
    };

    if (date < now.date) {
      return { ...base, open: false, closedReason: 'That date has passed.', slots: [] };
    }
    const maxDate = addDays(now.date, settings.maxAdvanceDays);
    if (date > maxDate) {
      return {
        ...base,
        open: false,
        closedReason: `Reservations open up to ${settings.maxAdvanceDays} days ahead.`,
        slots: [],
      };
    }
    const disabled = await this.prisma.disabledDate.findUnique({
      where: { date: new Date(date) },
    });
    if (disabled) {
      return {
        ...base,
        open: false,
        closedReason: disabled.reason || 'This date is unavailable.',
        slots: [],
      };
    }

    const slotTimes = buildSlots(
      settings.openingTime,
      settings.closingTime,
      settings.slotDurationMinutes,
    );

    // Booked guests per slot for this date.
    const rows = await this.prisma.reservation.groupBy({
      by: ['time'],
      where: { date: new Date(date), status: { in: ACTIVE } },
      _sum: { guests: true },
    });
    const bookedByTime = new Map<string, number>(
      rows.map((r) => [r.time, r._sum.guests ?? 0] as const),
    );

    const minStartToday =
      date === now.date
        ? now.minutes + settings.leadTimeHours * 60
        : -Infinity;

    const slots: AvailabilitySlot[] = slotTimes.map((time) => {
      const booked = bookedByTime.get(time) ?? 0;
      const remaining = Math.max(0, settings.capacityPerSlot - booked);
      const withinLead = toMinutes(time) >= minStartToday;
      return {
        time,
        capacity: settings.capacityPerSlot,
        booked,
        remaining,
        available: withinLead && remaining > 0,
      };
    });

    return { ...base, open: slots.some((s) => s.available), slots };
  }

  // ---------------- create (public, concurrency-safe) ----------------

  async createPublic(
    dto: CreateReservationDto,
    meta: { ip?: string | null },
  ) {
    const settings = await this.getSettings();

    if (dto.guests > settings.maxGuestsPerReservation) {
      throw new BadRequestException(
        `We can take up to ${settings.maxGuestsPerReservation} guests per reservation. Please call us for larger groups.`,
      );
    }

    const availability = await this.getAvailability(dto.date);
    if (!availability.open) {
      throw new BadRequestException(
        availability.closedReason ?? 'That date is not available.',
      );
    }
    const slot = availability.slots.find((s) => s.time === dto.time);
    if (!slot) {
      throw new BadRequestException('That time is not a valid slot.');
    }
    if (!slot.available) {
      throw new ConflictException(
        'That time slot is not available. Please choose another.',
      );
    }

    const reservation = await this.prisma.$transaction(async (tx) => {
      // Serialise concurrent bookings for this exact slot.
      const lockKey = `${dto.date}|${dto.time}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;

      const agg = await tx.reservation.aggregate({
        _sum: { guests: true },
        where: {
          date: new Date(dto.date),
          time: dto.time,
          status: { in: ACTIVE },
        },
      });
      const booked = agg._sum.guests ?? 0;
      if (booked + dto.guests > settings.capacityPerSlot) {
        throw new ConflictException(
          'That time slot just filled up. Please choose another.',
        );
      }

      const created = await tx.reservation.create({
        data: {
          reference: await uniqueReference(tx, dto.date),
          fullName: dto.fullName.trim(),
          phone: dto.phone,
          email: dto.email?.trim() || null,
          date: new Date(dto.date),
          time: dto.time,
          guests: dto.guests,
          note: dto.note?.trim() || null,
          status: 'PENDING',
          source: 'WEBSITE',
          ip: meta.ip ?? null,
        },
      });
      await tx.reservationStatusHistory.create({
        data: {
          reservationId: created.id,
          toStatus: 'PENDING',
          note: 'Submitted from the website',
        },
      });
      return created;
    });

    // Best-effort, outside the transaction — a failed notification must not
    // fail the booking the guest just made.
    await this.notify({
      type: 'RESERVATION_CREATED',
      title: 'New reservation request',
      message: `${reservation.fullName} · ${dto.guests} guest(s) · ${dto.date} ${dto.time}`,
      entityId: reservation.id,
    });

    return {
      reference: reservation.reference,
      status: reservation.status,
      date: dto.date,
      time: reservation.time,
      guests: reservation.guests,
    };
  }

  // ---------------- admin ----------------

  async list(query: ReservationQueryDto) {
    const where: Prisma.ReservationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            date: {
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
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        orderBy: [{ date: 'desc' }, { time: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.reservation.count({ where }),
    ]);
    return paginate(items, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { history: { orderBy: { createdAt: 'asc' } } },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async transition(
    id: string,
    toStatus: ReservationStatus,
    note: string | undefined,
    ctx: AuditContext,
  ) {
    const current = await this.prisma.reservation.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Reservation not found');

    if (!ALLOWED_TRANSITIONS[current.status].includes(toStatus)) {
      throw new BadRequestException(
        `Cannot change a ${current.status} reservation to ${toStatus}.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.reservation.update({
        where: { id },
        data: { status: toStatus, handledById: ctx.actorId ?? null },
      });
      await tx.reservationStatusHistory.create({
        data: {
          reservationId: id,
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
      action: `reservation.${toStatus.toLowerCase()}`,
      entityType: 'Reservation',
      entityId: id,
      before: { status: current.status },
      after: { status: toStatus },
    });

    if (toStatus === 'CANCELLED') {
      await this.notify({
        type: 'RESERVATION_CANCELLED',
        title: 'Reservation cancelled',
        message: `${current.reference} · ${current.fullName}`,
        entityId: id,
      });
    }
    return updated;
  }

  /** Writes an in-app notification. Best-effort; never throws. */
  private async notify(input: {
    type: NotificationType;
    title: string;
    message: string;
    entityId: string;
  }): Promise<void> {
    await this.notifications.emit({
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: 'Reservation',
      entityId: input.entityId,
    });
  }
}

// ---------------- helpers ----------------

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function buildSlots(open: string, close: string, step: number): string[] {
  const out: string[] = [];
  for (let m = toMinutes(open); m + step <= toMinutes(close); m += step) {
    out.push(
      `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    );
  }
  return out;
}

function nowInTz(tz: string): { date: string; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
    return {
      date: `${get('year')}-${get('month')}-${get('day')}`,
      minutes: Number(get('hour')) * 60 + Number(get('minute')),
    };
  } catch {
    const d = new Date();
    return {
      date: d.toISOString().slice(0, 10),
      minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
    };
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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
    const ref = `HR-${datePart}-${rand}`;
    const exists = await tx.reservation.findUnique({ where: { reference: ref } });
    if (!exists) return ref;
  }
  return `HR-${datePart}-${Date.now().toString(36).toUpperCase()}`;
}
