import { Module } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsRepository } from './pets.repository';
import { CaslModule } from '../casl/casl.module';
import { SharedModule } from '../shared/shared.module';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  controllers: [PetsController],
  imports: [SharedModule, CaslModule, SubscriptionModule],
  providers: [
    PetsService,
    PetsRepository,
    { provide: IPetsRepository, useExisting: PetsRepository },
  ],
  exports: [PetsRepository, IPetsRepository],
})
export class PetsModule {}
