import { forwardRef, Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsRepository } from './medical-records.repository';
import { SharedModule } from '../shared/shared.module';
import { CleanupAttachmentsTask } from './tasks/cleanup-attachments.task';
import { CaslModule } from '../casl/casl.module';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [SharedModule, CaslModule, forwardRef(() => PetsModule)],
  controllers: [MedicalRecordsController],
  providers: [
    MedicalRecordsService,
    MedicalRecordsRepository,
    CleanupAttachmentsTask,
  ],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
