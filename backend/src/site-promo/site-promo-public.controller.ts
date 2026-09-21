import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SitePromoService } from './site-promo.service';

@Public()
@Controller('public/site-promo')
export class SitePromoPublicController {
  constructor(private readonly sitePromo: SitePromoService) {}

  @Get()
  // Admin edits must reach visitors immediately — see the other public
  // controllers for why this is always no-store.
  @Header('Cache-Control', 'no-store')
  get() {
    return this.sitePromo.getPublic();
  }
}
