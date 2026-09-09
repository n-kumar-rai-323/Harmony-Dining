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

@Public()
@Controller('public/menu')
export class MenuPublicController {
  constructor(private readonly menu: MenuPublicService) {}

  @Get()
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  getMenu() {
    return this.menu.getMenu();
  }

  @Get('featured')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  getFeatured(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.menu.getFeatured(limit);
  }
}
