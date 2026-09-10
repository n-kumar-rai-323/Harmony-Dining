import { Module } from '@nestjs/common';
import { SiteSettingsAdminController } from './site-settings-admin.controller';
import { SiteSettingsPublicController } from './site-settings-public.controller';
import { SiteSettingsService } from './site-settings.service';

@Module({
  controllers: [SiteSettingsAdminController, SiteSettingsPublicController],
  providers: [SiteSettingsService],
})
export class SiteSettingsModule {}
