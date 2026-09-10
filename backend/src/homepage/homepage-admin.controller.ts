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
import { HomepageService, isHomepageSectionKey } from './homepage.service';
import { PublishSectionDto } from './dto';

@Controller('admin/homepage')
export class HomepageAdminController {
  constructor(private readonly homepage: HomepageService) {}

  @RequirePermissions('homepage.read')
  @Get()
  getAll() {
    return this.homepage.getAdminView();
  }

  @RequirePermissions('homepage.manage')
  @Put(':key')
  @HttpCode(200)
  update(
    @Param('key') key: string,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.homepage.update(
      this.assertKey(key),
      body,
      auditContext(req, actor),
    );
  }

  @RequirePermissions('homepage.manage')
  @Patch(':key/publish')
  @HttpCode(200)
  setPublished(
    @Param('key') key: string,
    @Body() dto: PublishSectionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.homepage.setPublished(
      this.assertKey(key),
      dto.isPublished,
      auditContext(req, actor),
    );
  }

  private assertKey(key: string) {
    if (!isHomepageSectionKey(key)) {
      throw new NotFoundException(`Unknown homepage section "${key}"`);
    }
    return key;
  }
}
