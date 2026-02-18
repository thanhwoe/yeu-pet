import { Module } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsRepository } from './pets.repository';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [PetsController],
  imports: [SharedModule],
  providers: [PetsService, PetsRepository],
})
export class PetsModule {}
