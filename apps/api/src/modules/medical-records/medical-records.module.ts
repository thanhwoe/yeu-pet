import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsRepository } from './medical-records.repository';
import { SharedModule } from '../shared/shared.module';
import { CleanupAttachmentsTask } from './tasks/cleanup-attachments.task';
import { CaslModule } from '../casl/casl.module';
import { PetsModule } from '../pets/pets.module';
import { IMedicalRecordsRepository } from '@app/interfaces/medical-records-repository.interface';

@Module({
  imports: [SharedModule, CaslModule, PetsModule],
  controllers: [MedicalRecordsController],
  providers: [
    MedicalRecordsService,
    MedicalRecordsRepository,
    {
      provide: IMedicalRecordsRepository,
      useExisting: MedicalRecordsRepository,
    },
    CleanupAttachmentsTask,
  ],
  exports: [
    MedicalRecordsService,
    MedicalRecordsRepository,
    IMedicalRecordsRepository,
  ],
})
export class MedicalRecordsModule {}
