import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SiteSettingsService } from './site-settings.service';

const CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

@Public()
@Controller('public/site')
export class SiteSettingsPublicController {
  constructor(private readonly settings: SiteSettingsService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  get() {
    return this.settings.getPublicBundle();
  }
}
