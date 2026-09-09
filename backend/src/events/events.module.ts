import { Module } from '@nestjs/common';
import { EventsAdminController } from './events-admin.controller';
import { EventsPublicController } from './events-public.controller';
import { EventsService } from './events.service';
import { EventsPublicService } from './events-public.service';

@Module({
  controllers: [EventsAdminController, EventsPublicController],
  providers: [EventsService, EventsPublicService],
})
export class EventsModule {}
