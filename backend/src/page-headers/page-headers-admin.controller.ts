import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { isPageHeaderKey, PageHeadersService } from './page-headers.service';
import { PublishPageHeaderDto } from './dto';

@Controller('admin/page-headers')
export class PageHeadersAdminController {
  constructor(private readonly pageHeaders: PageHeadersService) {}

  @RequirePermissions('pageHeaders.read')
  @Get()
  getAll() {
    return this.pageHeaders.getAdminView();
  }

  @RequirePermissions('pageHeaders.manage')
  @Put(':key')
  @HttpCode(200)
  update(
    @Param('key') key: string,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.pageHeaders.update(
      this.assertKey(key),
      body,
      auditContext(req, actor),
    );
  }

  @RequirePermissions('pageHeaders.manage')
  @Patch(':key/publish')
  @HttpCode(200)
  setPublished(
    @Param('key') key: string,
    @Body() dto: PublishPageHeaderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.pageHeaders.setPublished(
      this.assertKey(key),
      dto.isPublished,
      auditContext(req, actor),
    );
  }

  private assertKey(key: string) {
    if (!isPageHeaderKey(key)) {
      throw new NotFoundException(`Unknown page header "${key}"`);
    }
    return key;
  }
}
