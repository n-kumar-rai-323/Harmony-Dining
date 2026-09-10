import { Global, Module } from '@nestjs/common';
import { MailAdminController } from './mail-admin.controller';
import { MailService } from './mail.service';

@Global()
@Module({
  controllers: [MailAdminController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
