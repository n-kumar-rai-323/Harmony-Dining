import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { EnquiriesService } from './enquiries.service';
import {
  EnquiryConflictQueryDto,
  EnquiryQueryDto,
  EnquiryStatusDto,
} from './dto';

@Controller('admin/enquiries')
export class EnquiriesAdminController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @RequirePermissions('enquiries.read')
  @Get()
  list(@Query() query: EnquiryQueryDto) {
    return this.enquiries.list(query);
  }

  @RequirePermissions('enquiries.read')
  @Get('conflicts')
  conflicts(@Query() query: EnquiryConflictQueryDto) {
    return this.enquiries.conflictsFor(query.date);
  }

  @RequirePermissions('enquiries.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.enquiries.get(id);
  }

  @RequirePermissions('enquiries.update')
  @Post(':id/status')
  @HttpCode(200)
  setStatus(
    @Param('id') id: string,
    @Body() dto: EnquiryStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.enquiries.setStatus(
      id,
      dto.status,
      dto.note,
      auditContext(req, actor),
    );
  }
}
