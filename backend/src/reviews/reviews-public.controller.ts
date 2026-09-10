import {
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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { clientIp } from '../common/request-context';
import { PaginationQuery } from '../common/pagination';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';

const CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

@Public()
@Controller('public/reviews')
export class ReviewsPublicController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  @HttpCode(201)
  @Header('Cache-Control', 'no-store')
  // A genuine guest leaves one review; a script leaves many.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  submit(@Body() dto: CreateReviewDto, @Req() req: Request) {
    return this.reviews.submitPublic(dto, { ip: clientIp(req) });
  }

  @Get()
  @Header('Cache-Control', CACHE)
  list(@Query() query: PaginationQuery) {
    return this.reviews.publicList(query);
  }

  @Get('featured')
  @Header('Cache-Control', CACHE)
  featured(
    @Query('limit', new DefaultValuePipe(7), ParseIntPipe) limit: number,
  ) {
    return this.reviews.publicFeatured(limit);
  }
}
