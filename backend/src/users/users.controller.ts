import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import type { AuditContext } from '../audit/audit.service';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ListUsersQueryDto,
  ResetPasswordDto,
  SetPermissionsDto,
  UpdateUserDto,
} from './dto';

function auditCtx(req: Request, actor: AuthenticatedUser): AuditContext {
  return {
    actorId: actor.id,
    actorEmail: actor.email,
    ip:
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.ip) ?? null,
    userAgent: req.headers['user-agent'] ?? null,
    requestId: (req.headers['x-request-id'] as string) ?? null,
  };
}

@Controller('admin/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @RequirePermissions('users.read')
  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.users.list(query);
  }

  @RequirePermissions('users.read')
  @Get('permissions')
  listPermissions() {
    return this.users.listPermissions();
  }

  @RequirePermissions('users.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getById(id);
  }

  @RequirePermissions('users.manage')
  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.users.create(dto, actor, auditCtx(req, actor));
  }

  @RequirePermissions('users.manage')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.users.update(id, dto, actor, auditCtx(req, actor));
  }

  @RequirePermissions('users.manage')
  @Post(':id/reset-password')
  @HttpCode(200)
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    await this.users.resetPassword(
      id,
      dto.newPassword,
      actor,
      auditCtx(req, actor),
    );
    return { ok: true };
  }

  @RequirePermissions('users.manage')
  @Put(':id/permissions')
  @HttpCode(200)
  async setPermissions(
    @Param('id') id: string,
    @Body() dto: SetPermissionsDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    await this.users.setPermissionOverrides(id, dto, actor, auditCtx(req, actor));
    return { ok: true };
  }

  @RequirePermissions('users.manage')
  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    await this.users.softDelete(id, actor, auditCtx(req, actor));
    return { ok: true };
  }
}
