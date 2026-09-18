import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { clientIp } from '../common/request-context';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto';

@Public()
@Controller('public/contact')
export class ContactMessagesPublicController {
  constructor(private readonly messages: ContactMessagesService) {}

  @Post()
  @HttpCode(201)
  // A genuine guest sends one message; a script sends many.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  submit(@Body() dto: CreateContactMessageDto, @Req() req: Request) {
    return this.messages.submitPublic(dto, { ip: clientIp(req) });
  }
}
