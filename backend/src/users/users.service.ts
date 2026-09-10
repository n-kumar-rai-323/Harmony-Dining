import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminUser, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { PasswordService } from '../auth/password.service';
import { PermissionsService } from '../auth/permissions.service';
import { SessionService } from '../auth/session.service';
import type { AuthenticatedUser } from '../auth/types';
import type {
  CreateUserDto,
  ListUsersQueryDto,
  SetPermissionsDto,
  UpdateUserDto,
} from './dto';

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AdminUserSelect;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly permissions: PermissionsService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.AdminUserWhereInput = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.adminUser.findMany({
        where,
        select: PUBLIC_FIELDS,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /** The full permission catalogue, for the per-user override editor. */
  async listPermissions() {
    return this.prisma.permission.findMany({
      select: { key: true, description: true },
      orderBy: { key: 'asc' },
    });
  }

  async getById(id: string) {
    const user = await this.prisma.adminUser.findFirst({
      where: { id, deletedAt: null },
      select: PUBLIC_FIELDS,
    });
    if (!user) throw new NotFoundException('Admin user not found');

    const [effective, overrides] = await Promise.all([
      this.permissions.getEffectivePermissions(user.id, user.role),
      this.prisma.adminUserPermission.findMany({
        where: { adminUserId: id },
        select: { granted: true, permission: { select: { key: true } } },
      }),
    ]);

    return {
      ...user,
      effectivePermissions: effective,
      permissionOverrides: overrides.map((o) => ({
        key: o.permission.key,
        granted: o.granted,
      })),
    };
  }

  async create(dto: CreateUserDto, actor: AuthenticatedUser, ctx: AuditContext) {
    this.assertMayManageRole(dto.role, actor);
    if (!this.passwords.isStrongEnough(dto.password)) {
      throw new BadRequestException(
        'Password needs upper and lower case letters and a digit.',
      );
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const created = await this.prisma.adminUser.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role,
        passwordHash,
      },
      select: PUBLIC_FIELDS,
    });

    await this.audit.record({
      ...ctx,
      action: 'admin_user.create',
      entityType: 'AdminUser',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor: AuthenticatedUser,
    ctx: AuditContext,
  ) {
    const target = await this.requireUser(id);
    this.assertMayManageRole(target.role, actor);
    if (dto.role) this.assertMayManageRole(dto.role, actor);

    // Self-lockout protection.
    if (target.id === actor.id) {
      if (dto.status === 'DISABLED') {
        throw new ForbiddenException('You cannot disable your own account.');
      }
      if (dto.role && dto.role !== target.role) {
        throw new ForbiddenException('You cannot change your own role.');
      }
    }

    if (
      target.role === 'SUPER_ADMIN' &&
      (dto.role === 'ADMIN' || dto.role === 'MANAGER' || dto.role === 'STAFF' ||
        dto.status === 'DISABLED')
    ) {
      await this.assertNotLastSuperAdmin(target.id);
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data: {
        name: dto.name,
        role: dto.role,
        status: dto.status,
      },
      select: PUBLIC_FIELDS,
    });

    this.permissions.invalidate(id);
    if (dto.status === 'DISABLED') {
      await this.sessions.revokeAllForUser(id);
    }

    await this.audit.record({
      ...ctx,
      action: 'admin_user.update',
      entityType: 'AdminUser',
      entityId: id,
      before: {
        name: target.name,
        role: target.role,
        status: target.status,
      },
      after: updated,
    });
    return updated;
  }

  async resetPassword(
    id: string,
    newPassword: string,
    actor: AuthenticatedUser,
    ctx: AuditContext,
  ) {
    const target = await this.requireUser(id);
    this.assertMayManageRole(target.role, actor);
    if (!this.passwords.isStrongEnough(newPassword)) {
      throw new BadRequestException('Password is not strong enough.');
    }

    const passwordHash = await this.passwords.hash(newPassword);
    await this.prisma.adminUser.update({
      where: { id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    await this.sessions.revokeAllForUser(id);

    await this.audit.record({
      ...ctx,
      action: 'admin_user.reset_password',
      entityType: 'AdminUser',
      entityId: id,
    });
  }

  async setPermissionOverrides(
    id: string,
    dto: SetPermissionsDto,
    actor: AuthenticatedUser,
    ctx: AuditContext,
  ) {
    const target = await this.requireUser(id);
    this.assertMayManageRole(target.role, actor);

    const known = await this.prisma.permission.findMany({
      select: { id: true, key: true },
    });
    const idByKey = new Map(known.map((k) => [k.key, k.id]));

    const unknown = dto.overrides
      .map((o) => o.key)
      .filter((k) => !idByKey.has(k));
    if (unknown.length) {
      throw new BadRequestException(
        `Unknown permission key(s): ${unknown.join(', ')}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.adminUserPermission.deleteMany({
        where: { adminUserId: id },
      }),
      this.prisma.adminUserPermission.createMany({
        data: dto.overrides.map((o) => ({
          adminUserId: id,
          permissionId: idByKey.get(o.key)!,
          granted: o.granted,
        })),
      }),
    ]);

    this.permissions.invalidate(id);
    await this.audit.record({
      ...ctx,
      action: 'admin_user.set_permissions',
      entityType: 'AdminUser',
      entityId: id,
      after: { overrides: dto.overrides },
    });
  }

  async softDelete(id: string, actor: AuthenticatedUser, ctx: AuditContext) {
    const target = await this.requireUser(id);
    this.assertMayManageRole(target.role, actor);
    if (target.id === actor.id) {
      throw new ForbiddenException('You cannot delete your own account.');
    }
    if (target.role === 'SUPER_ADMIN') {
      await this.assertNotLastSuperAdmin(target.id);
    }

    await this.prisma.adminUser.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DISABLED' },
    });
    await this.sessions.revokeAllForUser(id);
    this.permissions.invalidate(id);

    await this.audit.record({
      ...ctx,
      action: 'admin_user.delete',
      entityType: 'AdminUser',
      entityId: id,
      before: { email: target.email, role: target.role },
    });
  }

  // ---- helpers ----

  private async requireUser(id: string): Promise<AdminUser> {
    const user = await this.prisma.adminUser.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new NotFoundException('Admin user not found');
    return user;
  }

  private assertMayManageRole(role: string, actor: AuthenticatedUser): void {
    if (role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Only a super admin can manage super admin accounts.',
      );
    }
  }

  private async assertNotLastSuperAdmin(excludeId: string): Promise<void> {
    const remaining = await this.prisma.adminUser.count({
      where: {
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        deletedAt: null,
        id: { not: excludeId },
      },
    });
    if (remaining === 0) {
      throw new ForbiddenException(
        'At least one active super admin must remain.',
      );
    }
  }
}
