import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PageHeadersService } from './page-headers.service';

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

@Public()
@Controller('public/page-headers')
export class PageHeadersPublicController {
  constructor(private readonly pageHeaders: PageHeadersService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  get() {
    return this.pageHeaders.getPublicBundle();
  }
}
