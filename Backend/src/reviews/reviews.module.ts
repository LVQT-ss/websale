import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import {
  TemplateReviewsController,
  ReviewsController,
  AdminReviewsController,
} from './reviews.controller.js';

@Module({
  controllers: [
    TemplateReviewsController,
    ReviewsController,
    AdminReviewsController,
  ],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
