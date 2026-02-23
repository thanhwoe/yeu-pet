import { Module } from '@nestjs/common';
import { FileUploadProcessor } from './file-upload.processor';
import { FileUploadService } from './file-upload.service';
import { IFileUploadService } from '@app/interfaces/file-upload.interface';
import { CloudinaryService } from './cloudinary/clodinary.service';
import { UsersRepository } from '@app/modules/users/users.repository';
import { PetsRepository } from '@app/modules/pets/pets.repository';
import { MedicalRecordsRepository } from '@app/modules/medical-records/medical-records.repository';
import { FileDeleteProcessor } from './file-delete.processor';

@Module({
  providers: [
    FileUploadService,
    UsersRepository,
    PetsRepository,
    MedicalRecordsRepository,
    FileUploadProcessor,
    FileDeleteProcessor,
    {
      provide: IFileUploadService,
      useClass: CloudinaryService,
    },
  ],
  exports: [FileUploadService],
})
export class FileUploadModule {}
