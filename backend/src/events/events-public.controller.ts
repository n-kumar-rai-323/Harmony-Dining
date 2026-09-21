import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { EventsPublicService } from './events-public.service';

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

@Public()
@Controller('public/events')
export class EventsPublicController {
  constructor(private readonly events: EventsPublicService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  list(@Query('type') type?: string) {
    const kind =
      type === 'past' || type === 'upcoming' ? type : 'all';
    return this.events.list(kind);
  }

  @Get('slugs')
  @Header('Cache-Control', CACHE)
  slugs() {
    return this.events.publishedSlugs();
  }

  @Get(':slug')
  @Header('Cache-Control', CACHE)
  detail(@Param('slug') slug: string) {
    return this.events.getBySlug(slug);
  }
}
