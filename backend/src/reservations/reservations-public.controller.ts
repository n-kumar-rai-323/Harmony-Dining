import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { clientIp } from '../common/request-context';
import { ReservationsService } from './reservations.service';
import { AvailabilityQueryDto, CreateReservationDto } from './dto';

// Availability can be cached briefly; a booking must never be.
const AVAIL_CACHE = 'public, max-age=30, s-maxage=60, stale-while-revalidate=120';

@Public()
@Controller('public/reservations')
export class ReservationsPublicController {
  constructor(private readonly reservations: ReservationsService) {}

  @Get('availability')
  @Header('Cache-Control', AVAIL_CACHE)
  availability(@Query() query: AvailabilityQueryDto) {
    return this.reservations.getAvailability(query.date);
  }

  @Post()
  @HttpCode(201)
  @Header('Cache-Control', 'no-store')
  // Tight limit: a real guest books once, a script hammers.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  create(@Body() dto: CreateReservationDto, @Req() req: Request) {
    return this.reservations.createPublic(dto, { ip: clientIp(req) });
  }
}
