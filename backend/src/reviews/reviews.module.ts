import { Module } from '@nestjs/common';
import { ReviewsAdminController } from './reviews-admin.controller';
import { ReviewsPublicController } from './reviews-public.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsAdminController, ReviewsPublicController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
