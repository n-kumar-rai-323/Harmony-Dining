import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { ReorderDto } from '../menu/dto';
import { GalleryService } from './gallery.service';
import {
  CreateGalleryItemDto,
  GalleryQueryDto,
  UpdateGalleryItemDto,
} from './dto';

@Controller('admin/gallery')
export class GalleryAdminController {
  constructor(private readonly gallery: GalleryService) {}

  @RequirePermissions('gallery.read')
  @Get()
  list(@Query() query: GalleryQueryDto) {
    return this.gallery.list(query);
  }

  @RequirePermissions('gallery.manage')
  @Post('reorder')
  @HttpCode(200)
  async reorder(
    @Body() dto: ReorderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.gallery.reorder(dto, auditContext(req, actor));
    return { ok: true };
  }

  @RequirePermissions('gallery.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.gallery.get(id);
  }

  @RequirePermissions('gallery.manage')
  @Post()
  create(
    @Body() dto: CreateGalleryItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.gallery.create(dto, auditContext(req, actor));
  }

  @RequirePermissions('gallery.manage')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.gallery.update(id, dto, auditContext(req, actor));
  }

  @RequirePermissions('gallery.manage')
  @Post(':id/publish')
  @HttpCode(200)
  publish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.gallery.setStatus(id, 'PUBLISHED', auditContext(req, actor));
  }

  @RequirePermissions('gallery.manage')
  @Post(':id/unpublish')
  @HttpCode(200)
  unpublish(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.gallery.setStatus(id, 'DRAFT', auditContext(req, actor));
  }

  @RequirePermissions('gallery.manage')
  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.gallery.delete(id, auditContext(req, actor));
    return { ok: true };
  }
}
