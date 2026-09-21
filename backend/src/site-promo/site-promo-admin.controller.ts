import { Body, Controller, Get, HttpCode, Patch, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { SitePromoService } from './site-promo.service';
import { PublishSitePromoDto } from './dto';

@Controller('admin/site-promo')
export class SitePromoAdminController {
  constructor(private readonly sitePromo: SitePromoService) {}

  @RequirePermissions('sitePromo.read')
  @Get()
  get() {
    return this.sitePromo.getAdminView();
  }

  @RequirePermissions('sitePromo.manage')
  @Put()
  @HttpCode(200)
  update(
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.sitePromo.update(body, auditContext(req, actor));
  }

  @RequirePermissions('sitePromo.manage')
  @Patch('publish')
  @HttpCode(200)
  setPublished(
    @Body() dto: PublishSitePromoDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.sitePromo.setPublished(dto.isPublished, auditContext(req, actor));
  }
}
