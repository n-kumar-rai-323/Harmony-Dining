import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination';
import type { AuditQueryDto } from './dto';

export interface AuditContext {
  actorId?: string | null;
  actorEmail?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export interface AuditEntry extends AuditContext {
  action: string; // e.g. "menu_item.update"
  entityType: string; // e.g. "MenuItem"
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}

const SECRET_KEYS = new Set([
  'password',
  'passwordhash',
  'passwordHash',
  'newpassword',
  'oldpassword',
  'token',
  'tokenhash',
  'tokenHash',
  'secret',
  'sessionsecret',
  'accesskey',
  'secretaccesskey',
  'smtppassword',
]);

/** Strips anything that looks like a credential before it is stored. */
function redact(value: unknown, depth = 0): unknown {
  if (value == null || depth > 6) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEYS.has(k.toLowerCase())
        ? '[redacted]'
        : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an admin action. Never throws — a failed audit write must not
   * break the business operation that triggered it.
   */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId ?? null,
          actorEmail: entry.actorEmail ?? null,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          before:
            entry.before === undefined
              ? undefined
              : (redact(entry.before) as never),
          after:
            entry.after === undefined
              ? undefined
              : (redact(entry.after) as never),
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
          requestId: entry.requestId ?? null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log for ${entry.action}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /* ----------------------------------------------------- read (audit.read) */

  private buildWhere(query: AuditQueryDto): Prisma.AuditLogWhereInput {
    const and: Prisma.AuditLogWhereInput[] = [];

    if (query.actorId) and.push({ actorId: query.actorId });
    if (query.actorEmail) {
      and.push({
        actorEmail: { equals: query.actorEmail, mode: 'insensitive' },
      });
    }
    if (query.action) and.push({ action: query.action });
    if (query.actionPrefix) {
      and.push({ action: { startsWith: query.actionPrefix } });
    }
    if (query.entityType) and.push({ entityType: query.entityType });
    if (query.entityId) and.push({ entityId: query.entityId });

    if (query.from || query.to) {
      and.push({
        createdAt: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to ? { lt: new Date(query.to) } : {}),
        },
      });
    }

    if (query.search) {
      const contains = { contains: query.search, mode: 'insensitive' } as const;
      and.push({
        OR: [
          { action: contains },
          { entityType: contains },
          { entityId: contains },
          { actorEmail: contains },
        ],
      });
    }

    return and.length ? { AND: and } : {};
  }

  /** Paginated, filtered view of the append-only audit trail. */
  async list(query: AuditQueryDto) {
    const where = this.buildWhere(query);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          actor: { select: { id: true, email: true, name: true, status: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginate(rows, total, query.page, query.pageSize);
  }

  async get(id: string) {
    const row = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: { select: { id: true, email: true, name: true, status: true } },
      },
    });
    if (!row) throw new NotFoundException('Audit entry not found');
    return row;
  }

  /**
   * Distinct `action` and `entityType` values (with counts) so the admin UI
   * can populate filter dropdowns without scanning the whole table.
   */
  async facets() {
    const [actions, entityTypes] = await this.prisma.$transaction([
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { action: 'asc' },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        _count: true,
        orderBy: { entityType: 'asc' },
      }),
    ]);

    return {
      actions: actions.map((a) => ({ value: a.action, count: a._count })),
      entityTypes: entityTypes.map((e) => ({
        value: e.entityType,
        count: e._count,
      })),
    };
  }
}
