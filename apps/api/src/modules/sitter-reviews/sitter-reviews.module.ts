import { Module } from '@nestjs/common';
import { SitterReviewsService } from './sitter-reviews.service';
import { SitterReviewsController } from './sitter-reviews.controller';
import { SitterReviewsRepository } from './sitter-reviews.repository';
import { SitterBookingsModule } from '../sitter-bookings/sitter-bookings.module';

@Module({
  imports: [SitterBookingsModule],
  controllers: [SitterReviewsController],
  providers: [SitterReviewsService, SitterReviewsRepository],
})
export class SitterReviewsModule {}
