import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { HomepageService } from './homepage.service';

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

@Public()
@Controller('public/homepage')
export class HomepagePublicController {
  constructor(private readonly homepage: HomepageService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  get() {
    return this.homepage.getPublicBundle();
  }
}
