import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
