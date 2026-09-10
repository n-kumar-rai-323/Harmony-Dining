import { Module } from '@nestjs/common';
import { HomepageAdminController } from './homepage-admin.controller';
import { HomepagePublicController } from './homepage-public.controller';
import { HomepageService } from './homepage.service';

@Module({
  controllers: [HomepageAdminController, HomepagePublicController],
  providers: [HomepageService],
})
export class HomepageModule {}
