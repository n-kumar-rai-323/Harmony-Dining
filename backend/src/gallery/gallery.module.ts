import { Module } from '@nestjs/common';
import { GalleryAdminController } from './gallery-admin.controller';
import { GalleryPublicController } from './gallery-public.controller';
import { GalleryService } from './gallery.service';
import { GalleryPublicService } from './gallery-public.service';

@Module({
  controllers: [GalleryAdminController, GalleryPublicController],
  providers: [GalleryService, GalleryPublicService],
})
export class GalleryModule {}
