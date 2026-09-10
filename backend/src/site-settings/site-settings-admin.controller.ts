import { Body, Controller, Get, HttpCode, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { SiteSettingsService } from './site-settings.service';
import { BusinessDto, UpdateHoursDto, UpdateSocialDto } from './dto';

@Controller('admin/site-settings')
export class SiteSettingsAdminController {
  constructor(private readonly settings: SiteSettingsService) {}

  @RequirePermissions('settings.read')
  @Get()
  getAll() {
    return this.settings.getAdminView();
  }

  @RequirePermissions('settings.manage')
  @Put('business')
  @HttpCode(200)
  updateBusiness(
    @Body() dto: BusinessDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settings.update('business', dto, auditContext(req, actor));
  }

  @RequirePermissions('settings.manage')
  @Put('hours')
  @HttpCode(200)
  updateHours(
    @Body() dto: UpdateHoursDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settings.update('hours', dto.entries, auditContext(req, actor));
  }

  @RequirePermissions('settings.manage')
  @Put('social')
  @HttpCode(200)
  updateSocial(
    @Body() dto: UpdateSocialDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.settings.update('social', dto.links, auditContext(req, actor));
  }
}
