import { Module } from '@nestjs/common';
import { ContactMessagesAdminController } from './contact-messages-admin.controller';
import { ContactMessagesPublicController } from './contact-messages-public.controller';
import { ContactMessagesService } from './contact-messages.service';

@Module({
  controllers: [ContactMessagesAdminController, ContactMessagesPublicController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}
