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
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { ISitterBookingsRepository } from '@app/interfaces/sitter-bookings-repository.interface';
import { ISitterReviewsRepository } from '@app/interfaces/sitter-reviews-repository.interface';
import { ISitterBookingMessagesRepository } from '@app/interfaces/sitter-booking-messages-repository.interface';
import { SitterBookingMessagesController } from './bookings/messages/sitter-booking-messages.controller';
import { SitterBookingMessagesRepository } from './bookings/messages/sitter-booking-messages.repository';
import { SitterBookingMessagesService } from './bookings/messages/sitter-booking-messages.service';
import { SitterBookingChatGateway } from './bookings/messages/sitter-booking-chat.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CaslModule, PetsModule, NotificationsModule, UsersModule],
  controllers: [
    PetSittersController,
    SitterBookingsController,
    SitterBookingMessagesController,
    SitterReviewsController,
  ],
  providers: [
    PetSittersRepository,
    { provide: IPetSittersRepository, useExisting: PetSittersRepository },
    PetSittersService,
    SitterBookingsRepository,
    {
      provide: ISitterBookingsRepository,
      useExisting: SitterBookingsRepository,
    },
    SitterBookingsService,
    SitterBookingMessagesRepository,
    {
      provide: ISitterBookingMessagesRepository,
      useExisting: SitterBookingMessagesRepository,
    },
    SitterBookingMessagesService,
    SitterBookingChatGateway,
    ActiveBookingsTask,
    SitterReviewsRepository,
    { provide: ISitterReviewsRepository, useExisting: SitterReviewsRepository },
    SitterReviewsService,
  ],
  exports: [
    PetSittersRepository,
    IPetSittersRepository,
    SitterBookingsRepository,
    ISitterBookingsRepository,
  ],
})
export class SitterBookingModule {}
