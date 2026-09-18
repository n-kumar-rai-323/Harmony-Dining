import {
  Body,
  Controller,
  Delete,
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
import { ReviewsService } from './reviews.service';
import { AdminCreateReviewDto, ReplyToReviewDto, ReviewQueryDto } from './dto';

@Controller('admin/reviews')
export class ReviewsAdminController {
  constructor(private readonly reviews: ReviewsService) {}

  @RequirePermissions('reviews.read')
  @Get()
  list(@Query() query: ReviewQueryDto) {
    return this.reviews.list(query);
  }

  @RequirePermissions('reviews.moderate')
  @Post()
  create(
    @Body() dto: AdminCreateReviewDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.adminCreate(dto, auditContext(req, actor));
  }

  @RequirePermissions('reviews.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.reviews.get(id);
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/approve')
  @HttpCode(200)
  approve(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.approve(id, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/reject')
  @HttpCode(200)
  reject(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.reject(id, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/publish')
  @HttpCode(200)
  publish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.setPublished(id, true, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/unpublish')
  @HttpCode(200)
  unpublish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.setPublished(id, false, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/feature')
  @HttpCode(200)
  feature(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.setFeatured(id, true, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/unfeature')
  @HttpCode(200)
  unfeature(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.setFeatured(id, false, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Post(':id/reply')
  @HttpCode(200)
  reply(
    @Param('id') id: string,
    @Body() dto: ReplyToReviewDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reviews.reply(id, dto, auditContext(req, actor));
  }

  @RequirePermissions('reviews.moderate')
  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.reviews.softDelete(id, auditContext(req, actor));
    return { ok: true };
  }
}
