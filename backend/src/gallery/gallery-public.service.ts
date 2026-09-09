import { Injectable } from '@nestjs/common';
import type { GalleryCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicGalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: GalleryCategory;
  image: string;
  alt: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  featuredOnHome: boolean;
}

@Injectable()
export class GalleryPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async list(opts: {
    category?: GalleryCategory;
    featuredHome?: boolean;
    limit?: number;
  }): Promise<PublicGalleryItem[]> {
    const rows = await this.prisma.galleryItem.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        ...(opts.category ? { category: opts.category } : {}),
        ...(opts.featuredHome ? { featuredOnHome: true } : {}),
        media: { deletedAt: null },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: opts.limit ? Math.min(opts.limit, 60) : undefined,
      include: {
        media: { select: { url: true, width: true, height: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.caption,
      category: r.category,
      image: r.media.url,
      alt: r.altText,
      width: r.media.width,
      height: r.media.height,
      sortOrder: r.sortOrder,
      featuredOnHome: r.featuredOnHome,
    }));
  }
}
