import { Module } from '@nestjs/common';
import { SitePromoAdminController } from './site-promo-admin.controller';
import { SitePromoPublicController } from './site-promo-public.controller';
import { SitePromoService } from './site-promo.service';

@Module({
  controllers: [SitePromoAdminController, SitePromoPublicController],
  providers: [SitePromoService],
})
export class SitePromoModule {}
