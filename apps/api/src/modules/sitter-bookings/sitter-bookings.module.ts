import { Module } from '@nestjs/common';
import { SitterBookingsService } from './sitter-bookings.service';
import { SitterBookingsController } from './sitter-bookings.controller';
import { SitterBookingsRepository } from './sitter-bookings.repository';
import { PetSittersModule } from '../pet-sitters/pet-sitters.module';
import { PetsModule } from '../pets/pets.module';
import { ActiveBookingsTask } from './tasks/active-bookings.task';

@Module({
  imports: [PetSittersModule, PetsModule],
  controllers: [SitterBookingsController],
  providers: [
    SitterBookingsService,
    SitterBookingsRepository,
    ActiveBookingsTask,
  ],
  exports: [SitterBookingsRepository],
})
export class SitterBookingsModule {}
