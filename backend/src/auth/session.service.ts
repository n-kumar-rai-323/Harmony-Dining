import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import type { AdminUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AppConfig } from '../config/configuration';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export interface SessionValidationResult {
  user: AdminUser;
  sessionId: string;
}

@Injectable()
export class SessionService {
  private readonly ttlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.ttlMs = config.get('session', { infer: true }).ttlHours * 3600 * 1000;
  }

  /** Creates a session row and returns the raw (unhashed) cookie token. */
  async create(
    adminUserId: string,
    meta: { ip?: string | null; userAgent?: string | null },
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.ttlMs);

    await this.prisma.session.create({
      data: {
        tokenHash: sha256(token),
        adminUserId,
        ip: meta.ip ?? null,
        userAgent: meta.userAgent?.slice(0, 512) ?? null,
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  /**
   * Validates a raw cookie token. Returns null for any failure (missing,
   * expired, revoked, or the owning account is disabled/deleted).
   */
  async validate(rawToken: string): Promise<SessionValidationResult | null> {
    if (!rawToken) return null;

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: sha256(rawToken) },
      include: { admin: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now() ||
      session.admin.status !== 'ACTIVE' ||
      session.admin.deletedAt
    ) {
      return null;
    }

    // Best-effort activity bump (throttled to once per minute).
    if (Date.now() - session.lastSeenAt.getTime() > 60_000) {
      await this.prisma.session
        .update({
          where: { id: session.id },
          data: { lastSeenAt: new Date() },
        })
        .catch(() => undefined);
    }

    return { user: session.admin, sessionId: session.id };
  }

  async revoke(rawToken: string): Promise<void> {
    if (!rawToken) return;
    await this.prisma.session.updateMany({
      where: { tokenHash: sha256(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(
    adminUserId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        adminUserId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }

  /** Housekeeping — safe to call periodically. */
  async purgeExpired(): Promise<number> {
    const { count } = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            revokedAt: {
              lt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
            },
          },
        ],
      },
    });
    return count;
  }
}
