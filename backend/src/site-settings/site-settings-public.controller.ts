import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SiteSettingsService } from './site-settings.service';

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

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
