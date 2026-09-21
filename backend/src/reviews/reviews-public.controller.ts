import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  HttpCode,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { clientIp } from '../common/request-context';
import { MediaService } from '../media/media.service';
import { MAX_UPLOAD_BYTES, multerImageFilter } from '../media/image-validation';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, PublicReviewQueryDto } from './dto';

// Admin edits must reach visitors immediately — no HTTP-level caching layer
// (browser, proxy, or CDN) gets to hold a stale copy of admin-managed content.
const CACHE = 'no-store';

@Public()
@Controller('public/reviews')
export class ReviewsPublicController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly media: MediaService,
  ) {}

  @Post()
  @HttpCode(201)
  @Header('Cache-Control', 'no-store')
  // A genuine guest leaves one review; a script leaves many.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  submit(@Body() dto: CreateReviewDto, @Req() req: Request) {
    return this.reviews.submitPublic(dto, { ip: clientIp(req) });
  }

  @Post('photos')
  @HttpCode(201)
  @Header('Cache-Control', 'no-store')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: multerImageFilter,
    }),
  )
  // A review carries at most 3 photos; leaves headroom for retries.
  @Throttle({ default: { limit: 12, ttl: 600_000 } })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('A file field named "file" is required');
    }
    const media = await this.media.upload(
      { buffer: file.buffer, originalname: file.originalname, size: file.size },
      { folder: 'reviews' },
      { ip: clientIp(req) },
    );
    return { id: media.id, url: media.url };
  }

  @Get()
  @Header('Cache-Control', CACHE)
  list(@Query() query: PublicReviewQueryDto) {
    return this.reviews.publicList(query);
  }

  @Get('stats')
  @Header('Cache-Control', CACHE)
  stats() {
    return this.reviews.publicStats();
  }

  @Get('featured')
  @Header('Cache-Control', CACHE)
  featured(
    @Query('limit', new DefaultValuePipe(7), ParseIntPipe) limit: number,
  ) {
    return this.reviews.publicFeatured(limit);
  }
}
