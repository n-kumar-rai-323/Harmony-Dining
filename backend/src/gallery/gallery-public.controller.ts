import {
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GalleryCategory } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { GalleryPublicService } from './gallery-public.service';

const CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

@Public()
@Controller('public/gallery')
export class GalleryPublicController {
  constructor(private readonly gallery: GalleryPublicService) {}

  @Get()
  @Header('Cache-Control', CACHE)
  list(@Query('category') category?: string) {
    const cat =
      category && category in GalleryCategory
        ? (category as GalleryCategory)
        : undefined;
    return this.gallery.list({ category: cat });
  }

  @Get('home')
  @Header('Cache-Control', CACHE)
  home(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return this.gallery.list({ featuredHome: true, limit });
  }
}
