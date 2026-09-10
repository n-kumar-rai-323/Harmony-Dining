import { Controller, Get, Query } from '@nestjs/common';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { MailService } from './mail.service';
import { MailLogQueryDto } from './dto';

@Controller('admin/mail-logs')
export class MailAdminController {
  constructor(private readonly mail: MailService) {}

  @RequirePermissions('mail.read')
  @Get()
  list(@Query() query: MailLogQueryDto) {
    return this.mail.listLogs(query);
  }
}
