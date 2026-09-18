import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PageHeadersService } from './page-headers.service';

const CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

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
