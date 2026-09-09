import { Module } from '@nestjs/common';
import { ReservationsAdminController } from './reservations-admin.controller';
import { ReservationsPublicController } from './reservations-public.controller';
import { ReservationsService } from './reservations.service';

@Module({
  controllers: [ReservationsAdminController, ReservationsPublicController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
