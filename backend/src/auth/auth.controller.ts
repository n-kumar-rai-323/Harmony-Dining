import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';

import { Public } from '../common/decorators/public.decorator';
import type { AppConfig } from '../config/configuration';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types';

const AUTH_TTL_MS = 5 * 60 * 1000;
const AUTH_LIMIT = 10;

function clientIp(req: Request): string | null {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.ip ?? null;
}

@Controller('auth')
export class AuthController {
  private readonly cookieName: string;
  private readonly cookieBase: CookieOptions;

  constructor(
    private readonly auth: AuthService,
    config: ConfigService<AppConfig, true>,
  ) {
    const s = config.get('session', { infer: true });
    this.cookieName = s.cookieName;
    this.cookieBase = {
      httpOnly: true,
      secure: s.cookieSecure,
      sameSite: s.cookieSameSite,
      domain: s.cookieDomain,
      path: '/',
      signed: true,
    };
  }

  @Public()
  @Throttle({ default: { limit: AUTH_LIMIT, ttl: AUTH_TTL_MS } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: PublicUser }> {
    const result = await this.auth.login(dto.email, dto.password, {
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
      requestId: (req.headers['x-request-id'] as string) ?? null,
    });

    res.cookie(this.cookieName, result.token, {
      ...this.cookieBase,
      expires: result.expiresAt,
    });

    return { user: toPublicUser(result.user) };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const raw =
      (req.signedCookies?.[this.cookieName] as string | undefined) ?? '';
    await this.auth.logout(raw, {
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    });
    res.clearCookie(this.cookieName, { ...this.cookieBase });
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): {
    user: { id: string; email: string; name: string; role: string };
    permissions: string[];
  } {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      permissions: user.permissions,
    };
  }

  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    await this.auth.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
      user.sessionId,
      {
        actorId: user.id,
        actorEmail: user.email,
        ip: clientIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      },
    );
    return { ok: true };
  }
}

interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function toPublicUser(u: {
  id: string;
  email: string;
  name: string;
  role: string;
}): PublicUser {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}
