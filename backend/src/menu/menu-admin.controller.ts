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
import { MenuService } from './menu.service';
import {
  CreateCategoryDto,
  CreateItemDto,
  ItemQueryDto,
  ReorderDto,
  UpdateCategoryDto,
  UpdateItemDto,
} from './dto';

@Controller('admin/menu')
export class MenuAdminController {
  constructor(private readonly menu: MenuService) {}

  // -------- categories --------

  @RequirePermissions('menu.read')
  @Get('categories')
  listCategories() {
    return this.menu.listCategories();
  }

  @RequirePermissions('menu.create')
  @Post('categories')
  createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.createCategory(dto, auditContext(req, actor));
  }

  @RequirePermissions('menu.update')
  @Post('categories/reorder')
  @HttpCode(200)
  async reorderCategories(
    @Body() dto: ReorderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.menu.reorderCategories(dto, auditContext(req, actor));
    return { ok: true };
  }

  @RequirePermissions('menu.update')
  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.updateCategory(id, dto, auditContext(req, actor));
  }

  @RequirePermissions('menu.publish')
  @Post('categories/:id/publish')
  @HttpCode(200)
  publishCategory(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.setCategoryStatus(id, 'PUBLISHED', auditContext(req, actor));
  }

  @RequirePermissions('menu.publish')
  @Post('categories/:id/unpublish')
  @HttpCode(200)
  unpublishCategory(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.setCategoryStatus(id, 'DRAFT', auditContext(req, actor));
  }

  @RequirePermissions('menu.delete')
  @Delete('categories/:id')
  @HttpCode(200)
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.menu.deleteCategory(id, auditContext(req, actor));
    return { ok: true };
  }

  // -------- items --------

  @RequirePermissions('menu.read')
  @Get('items')
  listItems(@Query() query: ItemQueryDto) {
    return this.menu.listItems(query);
  }

  @RequirePermissions('menu.update')
  @Post('items/reorder')
  @HttpCode(200)
  async reorderItems(
    @Body() dto: ReorderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.menu.reorderItems(dto, auditContext(req, actor));
    return { ok: true };
  }

  @RequirePermissions('menu.read')
  @Get('items/:id')
  getItem(@Param('id') id: string) {
    return this.menu.getItem(id);
  }

  @RequirePermissions('menu.create')
  @Post('items')
  createItem(
    @Body() dto: CreateItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.createItem(dto, auditContext(req, actor));
  }

  @RequirePermissions('menu.update')
  @Patch('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.updateItem(id, dto, auditContext(req, actor));
  }

  @RequirePermissions('menu.publish')
  @Post('items/:id/publish')
  @HttpCode(200)
  publishItem(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.setItemStatus(id, 'PUBLISHED', auditContext(req, actor));
  }

  @RequirePermissions('menu.publish')
  @Post('items/:id/unpublish')
  @HttpCode(200)
  unpublishItem(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.menu.setItemStatus(id, 'DRAFT', auditContext(req, actor));
  }

  @RequirePermissions('menu.delete')
  @Delete('items/:id')
  @HttpCode(200)
  async deleteItem(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.menu.deleteItem(id, auditContext(req, actor));
    return { ok: true };
  }
}
