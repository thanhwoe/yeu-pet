import { forwardRef, Module } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsRepository } from './pets.repository';
import { CaslModule } from '../casl/casl.module';
import { SharedModule } from '../shared/shared.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';

@Module({
  controllers: [PetsController],
  imports: [SharedModule, CaslModule, forwardRef(() => MedicalRecordsModule)],
  providers: [PetsService, PetsRepository],
  exports: [PetsRepository],
})
export class PetsModule {}
