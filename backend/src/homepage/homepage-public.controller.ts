import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { HomepageService } from './homepage.service';

const CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

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
