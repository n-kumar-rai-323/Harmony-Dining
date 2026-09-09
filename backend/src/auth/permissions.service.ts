import { Injectable } from '@nestjs/common';
import type { AdminRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CachedPermissions {
  keys: Set<string>;
  loadedAt: number;
}

const CACHE_TTL_MS = 30_000;

@Injectable()
export class PermissionsService {
  private cache = new Map<string, CachedPermissions>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Effective permission keys for a user:
   *   SUPER_ADMIN -> everything
   *   otherwise   -> role default grants, then per-user overrides applied
   *                  (granted=true adds, granted=false removes)
   */
  async getEffectivePermissions(
    userId: string,
    role: AdminRole,
  ): Promise<string[]> {
    if (role === 'SUPER_ADMIN') {
      return this.allPermissionKeys();
    }

    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
      return [...cached.keys];
    }

    const [roleGrants, overrides] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: { role },
        select: { permission: { select: { key: true } } },
      }),
      this.prisma.adminUserPermission.findMany({
        where: { adminUserId: userId },
        select: { granted: true, permission: { select: { key: true } } },
      }),
    ]);

    const keys = new Set(roleGrants.map((g) => g.permission.key));
    for (const o of overrides) {
      if (o.granted) keys.add(o.permission.key);
      else keys.delete(o.permission.key);
    }

    this.cache.set(userId, { keys, loadedAt: Date.now() });
    return [...keys];
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  private async allPermissionKeys(): Promise<string[]> {
    const rows = await this.prisma.permission.findMany({
      select: { key: true },
    });
    return rows.map((r) => r.key);
  }
}
