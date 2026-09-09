import { Module } from '@nestjs/common';
import { MenuAdminController } from './menu-admin.controller';
import { MenuPublicController } from './menu-public.controller';
import { MenuService } from './menu.service';
import { MenuPublicService } from './menu-public.service';

@Module({
  controllers: [MenuAdminController, MenuPublicController],
  providers: [MenuService, MenuPublicService],
  exports: [MenuPublicService],
})
export class MenuModule {}
