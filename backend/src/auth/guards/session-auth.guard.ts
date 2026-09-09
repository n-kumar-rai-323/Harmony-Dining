import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import type { AppConfig } from '../../config/configuration';
import { PermissionsService } from '../permissions.service';
import { SessionService } from '../session.service';

/**
 * Global guard (runs on every route). Skips routes marked @Public().
 * On success attaches `req.user` (with effective permissions).
 * Missing / invalid session -> 401.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly cookieName: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
    private readonly permissions: PermissionsService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.cookieName = config.get('session', { infer: true }).cookieName;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const raw =
      (request.signedCookies?.[this.cookieName] as string | undefined) ||
      (request.cookies?.[this.cookieName] as string | undefined);

    if (!raw) {
      throw new UnauthorizedException('Authentication required');
    }

    const result = await this.sessions.validate(raw);
    if (!result) {
      throw new UnauthorizedException('Session is invalid or has expired');
    }

    const permissionKeys = await this.permissions.getEffectivePermissions(
      result.user.id,
      result.user.role,
    );

    request.user = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      permissions: permissionKeys,
      sessionId: result.sessionId,
    };

    return true;
  }
}
