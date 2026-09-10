import { Global, Module } from '@nestjs/common';
import { NotificationsAdminController } from './notifications-admin.controller';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  controllers: [NotificationsAdminController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
