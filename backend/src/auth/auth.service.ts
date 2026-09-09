import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AdminUser } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const GENERIC_LOGIN_ERROR = 'Invalid email or password';

export interface LoginResult {
  user: AdminUser;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly audit: AuditService,
  ) {}

  async login(
    email: string,
    password: string,
    ctx: AuditContext & { ip?: string | null; userAgent?: string | null },
  ): Promise<LoginResult> {
    const user = await this.prisma.adminUser.findUnique({ where: { email } });

    // Constant-ish time whether or not the account exists.
    const passwordOk = await this.passwords.verify(
      password,
      user?.passwordHash ?? null,
    );

    if (!user || user.deletedAt) {
      await this.audit.record({
        ...ctx,
        actorEmail: email,
        action: 'auth.login.failure',
        entityType: 'AdminUser',
        after: { reason: 'unknown_account' },
      });
      throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
    }

    const locked =
      user.lockedUntil != null && user.lockedUntil.getTime() > Date.now();

    if (locked && passwordOk) {
      const minutes = Math.ceil(
        (user.lockedUntil!.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Account temporarily locked. Try again in ${minutes} minute(s).`,
      );
    }

    if (!passwordOk) {
      await this.registerFailedAttempt(user);
      await this.audit.record({
        ...ctx,
        actorId: user.id,
        actorEmail: user.email,
        action: 'auth.login.failure',
        entityType: 'AdminUser',
        entityId: user.id,
        after: { reason: 'bad_password' },
      });
      throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
    }

    if (user.status === 'DISABLED') {
      throw new ForbiddenException('This account has been disabled.');
    }

    // Success — clear counters, stamp login.
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const { token, expiresAt } = await this.sessions.create(user.id, {
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    await this.audit.record({
      ...ctx,
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.login.success',
      entityType: 'AdminUser',
      entityId: user.id,
    });

    return { user, token, expiresAt };
  }

  async logout(rawToken: string, ctx: AuditContext): Promise<void> {
    await this.sessions.revoke(rawToken);
    await this.audit.record({
      ...ctx,
      action: 'auth.logout',
      entityType: 'AdminUser',
      entityId: ctx.actorId ?? null,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentSessionId: string,
    ctx: AuditContext,
  ): Promise<void> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    const ok = await this.passwords.verify(currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (!this.passwords.isStrongEnough(newPassword)) {
      throw new ForbiddenException(
        'New password needs upper and lower case letters and a digit.',
      );
    }

    const passwordHash = await this.passwords.hash(newPassword);
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    });

    // Invalidate every other session.
    await this.sessions.revokeAllForUser(userId, currentSessionId);

    await this.audit.record({
      ...ctx,
      actorId: userId,
      actorEmail: user.email,
      action: 'auth.password_change',
      entityType: 'AdminUser',
      entityId: userId,
    });
  }

  private async registerFailedAttempt(user: AdminUser): Promise<void> {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60000)
          : user.lockedUntil,
      },
    });
  }
}
