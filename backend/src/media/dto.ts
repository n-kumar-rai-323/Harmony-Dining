import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQuery } from '../common/pagination';

export class UploadMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  folder?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  folder?: string;
}

export class MediaQueryDto extends PaginationQuery {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  folder?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
