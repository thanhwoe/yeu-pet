import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { IFileUploadService } from '@app/interfaces/file-upload.interface';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  providers: [
    FileUploadService,
    {
      provide: IFileUploadService,
      useClass: CloudinaryService,
    },
  ],
  exports: [FileUploadService, IFileUploadService],
})
export class FileUploadModule {}
