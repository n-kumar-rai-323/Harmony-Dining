import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { EventLifecycle } from '@prisma/client';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { EventsService } from './events.service';
import { CreateEventDto, EventQueryDto, UpdateEventDto } from './dto';

@Controller('admin/events')
export class EventsAdminController {
  constructor(private readonly events: EventsService) {}

  @RequirePermissions('events.read')
  @Get()
  list(@Query() query: EventQueryDto) {
    return this.events.list(query);
  }

  @RequirePermissions('events.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.events.get(id);
  }

  @RequirePermissions('events.manage')
  @Post()
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.events.create(dto, auditContext(req, actor));
  }

  @RequirePermissions('events.manage')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.events.update(id, dto, auditContext(req, actor));
  }

  @RequirePermissions('events.publish')
  @Post(':id/publish')
  @HttpCode(200)
  publish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.events.setStatus(id, 'PUBLISHED', auditContext(req, actor));
  }

  @RequirePermissions('events.publish')
  @Post(':id/unpublish')
  @HttpCode(200)
  unpublish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.events.setStatus(id, 'DRAFT', auditContext(req, actor));
  }

  @RequirePermissions('events.publish')
  @Post(':id/lifecycle/:value')
  @HttpCode(200)
  lifecycle(
    @Param('id') id: string,
    @Param('value') value: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const lifecycle = value.toUpperCase() as EventLifecycle;
    if (!Object.values(EventLifecycle).includes(lifecycle)) {
      throw new BadRequestException(
        `Invalid lifecycle. Use one of: ${Object.values(EventLifecycle).join(', ')}`,
      );
    }
    return this.events.setLifecycle(id, lifecycle, auditContext(req, actor));
  }

  @RequirePermissions('events.manage')
  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.events.delete(id, auditContext(req, actor));
    return { ok: true };
  }
}
