import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicMenuVariant {
  name: string;
  price: number;
}

export interface PublicMenuItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  priceLabel: string | null;
  imageUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  variants: PublicMenuVariant[];
}

export interface PublicMenuCategory {
  id: string;
  slug: string;
  group: 'FOOD' | 'BEVERAGES' | 'BAR';
  name: string;
  description: string | null;
  items: PublicMenuItem[];
}

@Injectable()
export class MenuPublicService {
  constructor(private readonly prisma: PrismaService) {}

  /** Published categories + published items, ready for the public menu page. */
  async getMenu(): Promise<{ categories: PublicMenuCategory[] }> {
    const categories = await this.prisma.menuCategory.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        items: {
          where: { status: 'PUBLISHED', deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            media: { select: { url: true, deletedAt: true } },
            variants: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    return {
      categories: categories
        .filter((c) => c.items.length > 0)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          group: c.group,
          name: c.name,
          description: c.description,
          items: c.items.map(toPublicItem),
        })),
    };
  }

  /** Featured published items for the homepage Featured Menu section. */
  async getFeatured(limit = 8): Promise<PublicMenuItem[]> {
    const items = await this.prisma.menuItem.findMany({
      where: {
        isFeatured: true,
        status: 'PUBLISHED',
        deletedAt: null,
        category: { status: 'PUBLISHED', deletedAt: null },
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      take: Math.min(limit, 24),
      include: {
        media: { select: { url: true, deletedAt: true } },
        variants: { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, group: true } },
      },
    });
    return items.map(toPublicItem);
  }
}

type ItemRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: Prisma.Decimal | null;
  priceLabel: string | null;
  tags: string[];
  isFeatured: boolean;
  media: { url: string; deletedAt: Date | null } | null;
  variants: { label: string; price: Prisma.Decimal }[];
  category?: { name: string; group: string };
};

function toPublicItem(row: ItemRow): PublicMenuItem & { categoryName?: string } {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price == null ? null : Number(row.price),
    priceLabel: row.priceLabel,
    imageUrl: row.media && !row.media.deletedAt ? row.media.url : null,
    tags: row.tags,
    isFeatured: row.isFeatured,
    variants: row.variants.map((v) => ({
      name: v.label,
      price: Number(v.price),
    })),
    ...(row.category ? { categoryName: row.category.name } : {}),
  };
}
