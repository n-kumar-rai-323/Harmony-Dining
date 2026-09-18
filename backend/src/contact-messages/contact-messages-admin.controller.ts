import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { ContactMessagesService } from './contact-messages.service';
import { ContactMessageQueryDto } from './dto';

@Controller('admin/messages')
export class ContactMessagesAdminController {
  constructor(private readonly messages: ContactMessagesService) {}

  @RequirePermissions('messages.read')
  @Get()
  list(@Query() query: ContactMessageQueryDto) {
    return this.messages.list(query);
  }

  @RequirePermissions('messages.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.messages.get(id);
  }

  @RequirePermissions('messages.manage')
  @Post(':id/read')
  @HttpCode(200)
  markRead(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.messages.setRead(id, true, auditContext(req, actor));
  }

  @RequirePermissions('messages.manage')
  @Post(':id/unread')
  @HttpCode(200)
  markUnread(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.messages.setRead(id, false, auditContext(req, actor));
  }

  @RequirePermissions('messages.manage')
  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.messages.softDelete(id, auditContext(req, actor));
    return { ok: true };
  }
}
