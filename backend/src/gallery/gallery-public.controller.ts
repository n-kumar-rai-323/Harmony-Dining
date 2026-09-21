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

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

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
