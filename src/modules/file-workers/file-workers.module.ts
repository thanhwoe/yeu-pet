import { Module } from '@nestjs/common';
import { FileUploadModule } from '../shared/file-upload/file-upload.module';
import { UsersModule } from '../users/users.module';
import { PetsModule } from '../pets/pets.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { BudgetCategoriesModule } from '../budget-categories/budget-categories.module';
import { FileUploadProcessor } from './file-upload.processor';
import { FileDeleteProcessor } from './file-delete.processor';

@Module({
  imports: [
    FileUploadModule,
    UsersModule,
    PetsModule,
    MedicalRecordsModule,
    BudgetCategoriesModule,
  ],
  providers: [FileUploadProcessor, FileDeleteProcessor],
})
export class FiledWorkersModule {}
