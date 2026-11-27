import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppConfig } from '../../config/configuration';

/** CORS does not prevent requests from being sent. Validate unsafe browser origins. */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
    const origin = req.headers.origin;
    const allowed = this.config.get('corsOrigins', { infer: true });
    if (origin && !allowed.includes(origin)) {
      throw new ForbiddenException('Request origin is not allowed');
    }
    // Production cookie-authenticated writes require an explicit browser origin.
    if (!origin && req.headers.cookie && this.config.get('env', { infer: true }) === 'production') {
      throw new ForbiddenException('Origin is required for authenticated writes');
    }
    return true;
  }
}
