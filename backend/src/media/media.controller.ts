import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { MediaService } from './media.service';
import { MAX_UPLOAD_BYTES, multerImageFilter } from './image-validation';
import { MediaQueryDto, UpdateMediaDto, UploadMediaDto } from './dto';

@Controller('admin/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @RequirePermissions('media.read')
  @Get()
  list(@Query() query: MediaQueryDto) {
    return this.media.list(query);
  }

  @RequirePermissions('media.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.media.get(id);
  }

  @RequirePermissions('media.upload')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: multerImageFilter,
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('A file field named "file" is required');
    }
    return this.media.upload(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        size: file.size,
      },
      dto,
      auditContext(req, actor),
    );
  }

  @RequirePermissions('media.upload')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.media.update(id, dto, auditContext(req, actor));
  }

  @RequirePermissions('media.delete')
  @Delete(':id')
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.media.delete(id, auditContext(req, actor));
    return { ok: true };
  }
}
