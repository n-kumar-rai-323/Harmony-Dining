import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { uniqueSlug } from '../common/slug.util';
import { paginate } from '../common/pagination';
import type {
  CreateCategoryDto,
  CreateItemDto,
  ItemQueryDto,
  ReorderDto,
  UpdateCategoryDto,
  UpdateItemDto,
  VariantDto,
} from './dto';

const ITEM_INCLUDE = {
  category: { select: { id: true, name: true, group: true } },
  media: { select: { id: true, url: true } },
  variants: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.MenuItemInclude;

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ============ CATEGORIES ============

  listCategories() {
    return this.prisma.menuCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { items: { where: { deletedAt: null } } } },
      },
    });
  }

  async createCategory(dto: CreateCategoryDto, ctx: AuditContext) {
    const slug = await uniqueSlug(dto.name, (s) =>
      this.prisma.menuCategory
        .findUnique({ where: { slug: s } })
        .then(Boolean),
    );

    const created = await this.prisma.menuCategory.create({
      data: {
        name: dto.name.trim(),
        slug,
        group: dto.group,
        description: dto.description?.trim() || null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.audit.record({
      ...ctx,
      action: 'menu_category.create',
      entityType: 'MenuCategory',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, ctx: AuditContext) {
    const before = await this.requireCategory(id);
    const updated = await this.prisma.menuCategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        group: dto.group,
        description:
          dto.description === undefined
            ? undefined
            : dto.description.trim() || null,
        sortOrder: dto.sortOrder,
      },
    });
    await this.audit.record({
      ...ctx,
      action: 'menu_category.update',
      entityType: 'MenuCategory',
      entityId: id,
      before,
      after: updated,
    });
    return updated;
  }

  async setCategoryStatus(
    id: string,
    status: PublishStatus,
    ctx: AuditContext,
  ) {
    const before = await this.requireCategory(id);
    if (before.status === status) return before;
    const updated = await this.prisma.menuCategory.update({
      where: { id },
      data: { status },
    });
    await this.audit.record({
      ...ctx,
      action: `menu_category.${status === 'PUBLISHED' ? 'publish' : 'unpublish'}`,
      entityType: 'MenuCategory',
      entityId: id,
      before: { status: before.status },
      after: { status },
    });
    return updated;
  }

  async reorderCategories(dto: ReorderDto, ctx: AuditContext) {
    await this.prisma.$transaction(
      dto.items.map((e) =>
        this.prisma.menuCategory.update({
          where: { id: e.id },
          data: { sortOrder: e.sortOrder },
        }),
      ),
    );
    await this.audit.record({
      ...ctx,
      action: 'menu_category.reorder',
      entityType: 'MenuCategory',
      after: { order: dto.items },
    });
  }

  async deleteCategory(id: string, ctx: AuditContext) {
    const before = await this.requireCategory(id);
    const now = new Date();
    const [, itemsUpdated] = await this.prisma.$transaction([
      this.prisma.menuCategory.update({
        where: { id },
        data: { deletedAt: now, status: 'DRAFT' },
      }),
      this.prisma.menuItem.updateMany({
        where: { categoryId: id, deletedAt: null },
        data: { deletedAt: now, status: 'DRAFT' },
      }),
    ]);
    await this.audit.record({
      ...ctx,
      action: 'menu_category.delete',
      entityType: 'MenuCategory',
      entityId: id,
      before: { name: before.name, group: before.group },
      after: { softDeletedItems: itemsUpdated.count },
    });
  }

  // ============ ITEMS ============

  async listItems(query: ItemQueryDto) {
    const where: Prisma.MenuItemWhereInput = {
      deletedAt: null,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.menuItem.findMany({
        where,
        include: ITEM_INCLUDE,
        orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return paginate(
      rows.map(serializeItem),
      total,
      query.page,
      query.pageSize,
    );
  }

  async getItem(id: string) {
    const row = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: ITEM_INCLUDE,
    });
    if (!row) throw new NotFoundException('Menu item not found');
    return serializeItem(row);
  }

  async createItem(dto: CreateItemDto, ctx: AuditContext) {
    await this.requireCategory(dto.categoryId);
    await this.assertMediaExists(dto.mediaId);
    this.assertPricing(dto.price ?? null, dto.variants);

    const slug = await uniqueSlug(dto.name, (s) =>
      this.prisma.menuItem
        .findFirst({ where: { categoryId: dto.categoryId, slug: s } })
        .then(Boolean),
    );

    const created = await this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        price: dto.price ?? null,
        mediaId: dto.mediaId,
        dietary: dto.dietary ?? null,
        isAvailable: dto.isAvailable ?? true,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
        tags: dto.tags ?? [],
        ingredients: dto.ingredients ?? [],
        variants: dto.variants?.length
          ? {
              create: dto.variants.map((v, i) => ({
                label: v.label.trim(),
                price: v.price,
                sortOrder: v.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: ITEM_INCLUDE,
    });

    await this.audit.record({
      ...ctx,
      action: 'menu_item.create',
      entityType: 'MenuItem',
      entityId: created.id,
      after: serializeItem(created),
    });
    return serializeItem(created);
  }

  async updateItem(id: string, dto: UpdateItemDto, ctx: AuditContext) {
    const before = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
      include: ITEM_INCLUDE,
    });
    if (!before) throw new NotFoundException('Menu item not found');

    if (dto.categoryId && dto.categoryId !== before.categoryId) {
      await this.requireCategory(dto.categoryId);
    }
    if (dto.mediaId !== undefined) {
      await this.assertMediaExists(dto.mediaId);
    }

    const nextPrice = dto.price === undefined ? before.price : dto.price;
    const nextVariants = dto.variants;
    if (dto.price !== undefined || nextVariants) {
      this.assertPricing(
        nextPrice != null ? Number(nextPrice) : null,
        nextVariants ??
          before.variants.map((v) => ({ label: v.label, price: Number(v.price) })),
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (nextVariants) {
        const keepIds = nextVariants
          .map((v) => v.id)
          .filter((v): v is string => Boolean(v));
        await tx.menuItemVariant.deleteMany({
          where: { itemId: id, id: { notIn: keepIds } },
        });
        for (const [i, v] of nextVariants.entries()) {
          if (v.id) {
            await tx.menuItemVariant.update({
              where: { id: v.id },
              data: {
                label: v.label.trim(),
                price: v.price,
                sortOrder: v.sortOrder ?? i,
              },
            });
          } else {
            await tx.menuItemVariant.create({
              data: {
                itemId: id,
                label: v.label.trim(),
                price: v.price,
                sortOrder: v.sortOrder ?? i,
              },
            });
          }
        }
      }

      return tx.menuItem.update({
        where: { id },
        data: {
          categoryId: dto.categoryId,
          name: dto.name?.trim(),
          description:
            dto.description === undefined
              ? undefined
              : dto.description.trim() || null,
          price: dto.price === undefined ? undefined : dto.price,
          mediaId: dto.mediaId === undefined ? undefined : dto.mediaId,
          dietary: dto.dietary === undefined ? undefined : dto.dietary,
          isAvailable: dto.isAvailable,
          isFeatured: dto.isFeatured,
          sortOrder: dto.sortOrder,
          tags: dto.tags,
          ingredients: dto.ingredients,
        },
        include: ITEM_INCLUDE,
      });
    });

    await this.audit.record({
      ...ctx,
      action: 'menu_item.update',
      entityType: 'MenuItem',
      entityId: id,
      before: serializeItem(before),
      after: serializeItem(updated),
    });
    return serializeItem(updated);
  }

  async setItemStatus(id: string, status: PublishStatus, ctx: AuditContext) {
    const before = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new NotFoundException('Menu item not found');
    if (before.status === status) return this.getItem(id);
    await this.prisma.menuItem.update({ where: { id }, data: { status } });
    await this.audit.record({
      ...ctx,
      action: `menu_item.${status === 'PUBLISHED' ? 'publish' : 'unpublish'}`,
      entityType: 'MenuItem',
      entityId: id,
      before: { status: before.status },
      after: { status },
    });
    return this.getItem(id);
  }

  async reorderItems(dto: ReorderDto, ctx: AuditContext) {
    await this.prisma.$transaction(
      dto.items.map((e) =>
        this.prisma.menuItem.update({
          where: { id: e.id },
          data: { sortOrder: e.sortOrder },
        }),
      ),
    );
    await this.audit.record({
      ...ctx,
      action: 'menu_item.reorder',
      entityType: 'MenuItem',
      after: { order: dto.items },
    });
  }

  async deleteItem(id: string, ctx: AuditContext) {
    const before = await this.prisma.menuItem.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new NotFoundException('Menu item not found');
    await this.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DRAFT', isFeatured: false },
    });
    await this.audit.record({
      ...ctx,
      action: 'menu_item.delete',
      entityType: 'MenuItem',
      entityId: id,
      before: { name: before.name, categoryId: before.categoryId },
    });
  }

  // ============ helpers ============

  private async requireCategory(id: string) {
    const category = await this.prisma.menuCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Menu category not found');
    return category;
  }

  private async assertMediaExists(mediaId?: string | null): Promise<void> {
    if (!mediaId) return;
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null },
      select: { id: true },
    });
    if (!media) throw new BadRequestException('Referenced media does not exist');
  }

  private assertPricing(
    price: number | null,
    variants?: Pick<VariantDto, 'price' | 'label'>[],
  ): void {
    const hasPrice = price != null && price >= 0;
    const hasVariants = Boolean(variants && variants.length > 0);
    if (!hasPrice && !hasVariants) {
      throw new BadRequestException(
        'An item needs a price or at least one variant.',
      );
    }
  }
}

// Decimal -> number for the API surface.
function serializeItem(row: {
  price: Prisma.Decimal | null;
  variants: { price: Prisma.Decimal }[];
} & Record<string, unknown>) {
  return {
    ...row,
    price: row.price == null ? null : Number(row.price),
    variants: (row.variants as Array<Record<string, unknown>>).map((v) => ({
      ...v,
      price: Number(v.price as Prisma.Decimal),
    })),
  };
}
