import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto';

@Controller('admin/notifications')
export class NotificationsAdminController {
  constructor(private readonly notifications: NotificationsService) {}

  @RequirePermissions('notifications.read')
  @Get()
  list(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notifications.list(actor.id, query);
  }

  @RequirePermissions('notifications.read')
  @Get('unread-count')
  unreadCount(@CurrentUser() actor: AuthenticatedUser) {
    return this.notifications.unreadCount(actor.id);
  }

  @RequirePermissions('notifications.read')
  @Post('read-all')
  @HttpCode(200)
  markAllRead(@CurrentUser() actor: AuthenticatedUser) {
    return this.notifications.markAllRead(actor.id);
  }

  @RequirePermissions('notifications.read')
  @Post(':id/read')
  @HttpCode(200)
  markRead(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(actor.id, id);
  }
}
