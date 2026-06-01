import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { PetsModule } from '../pets/pets.module';
import { SitterBookingsController } from './bookings/sitter-bookings.controller';
import { SitterBookingsRepository } from './bookings/sitter-bookings.repository';
import { SitterBookingsService } from './bookings/sitter-bookings.service';
import { ActiveBookingsTask } from './bookings/tasks/active-bookings.task';
import { SitterReviewsController } from './reviews/sitter-reviews.controller';
import { SitterReviewsRepository } from './reviews/sitter-reviews.repository';
import { SitterReviewsService } from './reviews/sitter-reviews.service';
import { PetSittersController } from './sitters/pet-sitters.controller';
import { PetSittersRepository } from './sitters/pet-sitters.repository';
import { PetSittersService } from './sitters/pet-sitters.service';

@Module({
  imports: [CaslModule, PetsModule],
  controllers: [
    PetSittersController,
    SitterBookingsController,
    SitterReviewsController,
  ],
  providers: [
    PetSittersRepository,
    PetSittersService,
    SitterBookingsRepository,
    SitterBookingsService,
    ActiveBookingsTask,
    SitterReviewsRepository,
    SitterReviewsService,
  ],
  exports: [PetSittersRepository, SitterBookingsRepository],
})
export class SitterBookingModule {}
