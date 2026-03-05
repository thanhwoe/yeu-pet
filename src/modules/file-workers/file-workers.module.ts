import { Module } from '@nestjs/common';
import { FileUploadModule } from '../shared/file-upload/file-upload.module';
import { UsersModule } from '../users/users.module';
import { PetsModule } from '../pets/pets.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { BudgetCategoriesModule } from '../budget-categories/budget-categories.module';
import { FileUploadProcessor } from './file-upload.processor';
import { FileDeleteProcessor } from './file-delete.processor';
import { PhotoUploadProcessor } from './photo-upload.processor';
import { PhotosModule } from '../photos/photos.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    FileUploadModule,
    UsersModule,
    PetsModule,
    MedicalRecordsModule,
    BudgetCategoriesModule,
    PhotosModule,
  ],
  providers: [FileUploadProcessor, FileDeleteProcessor, PhotoUploadProcessor],
})
export class FiledWorkersModule {}
