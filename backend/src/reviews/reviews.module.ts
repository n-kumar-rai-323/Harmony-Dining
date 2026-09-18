import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ReviewsAdminController } from './reviews-admin.controller';
import { ReviewsPublicController } from './reviews-public.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [MediaModule],
  controllers: [ReviewsAdminController, ReviewsPublicController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
