import {
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { MenuPublicService } from './menu-public.service';

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

@Public()
@Controller('public/menu')
export class MenuPublicController {
  constructor(private readonly menu: MenuPublicService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  getMenu() {
    return this.menu.getMenu();
  }

  @Get('featured')
  @Header('Cache-Control', CACHE)
  getFeatured(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.menu.getFeatured(limit);
  }
}
