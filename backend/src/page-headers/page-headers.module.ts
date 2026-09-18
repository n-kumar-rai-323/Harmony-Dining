import { Module } from '@nestjs/common';
import { PageHeadersAdminController } from './page-headers-admin.controller';
import { PageHeadersPublicController } from './page-headers-public.controller';
import { PageHeadersService } from './page-headers.service';

@Module({
  controllers: [PageHeadersAdminController, PageHeadersPublicController],
  providers: [PageHeadersService],
})
export class PageHeadersModule {}
