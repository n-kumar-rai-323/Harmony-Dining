import { Body, Controller, Header, HttpCode, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { clientIp } from '../common/request-context';
import { EnquiriesService } from './enquiries.service';
import { CreateEventEnquiryDto } from './dto';

@Public()
@Controller('public/enquiries')
export class EnquiriesPublicController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Post()
  @HttpCode(201)
  @Header('Cache-Control', 'no-store')
  // A genuine planner sends one enquiry; a script sends many.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  create(@Body() dto: CreateEventEnquiryDto, @Req() req: Request) {
    return this.enquiries.create(dto, { ip: clientIp(req) });
  }
}
