import { Module } from '@nestjs/common';
import { EnquiriesAdminController } from './enquiries-admin.controller';
import { EnquiriesPublicController } from './enquiries-public.controller';
import { EnquiriesService } from './enquiries.service';

@Module({
  controllers: [EnquiriesAdminController, EnquiriesPublicController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}
