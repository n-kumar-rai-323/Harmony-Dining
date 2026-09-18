import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { GalleryCategory, PublishStatus } from '@prisma/client';
import { PaginationQuery } from '../common/pagination';
import { MinWords } from '../common/validators/min-words.validator';

export class CreateGalleryItemDto {
  @IsString()
  mediaId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @MinWords(2, { message: 'Title must be at least 2 words' })
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @MinWords(3, { message: 'Alt text must describe the image in at least 3 words' })
  altText!: string;

  @IsEnum(GalleryCategory)
  category!: GalleryCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @MinWords(3, { message: 'Caption must be at least 3 words' })
  caption?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  featuredOnHome?: boolean;
}

export class UpdateGalleryItemDto {
  @IsOptional()
  @IsString()
  mediaId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @MinWords(2, { message: 'Title must be at least 2 words' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @MinWords(3, { message: 'Alt text must describe the image in at least 3 words' })
  altText?: string;

  @IsOptional()
  @IsEnum(GalleryCategory)
  category?: GalleryCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @MinWords(3, { message: 'Caption must be at least 3 words' })
  caption?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  featuredOnHome?: boolean;
}

export class GalleryQueryDto extends PaginationQuery {
  @IsOptional()
  @IsEnum(GalleryCategory)
  category?: GalleryCategory;

  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;
}
