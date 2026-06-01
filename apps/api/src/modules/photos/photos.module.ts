import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { PhotosRepository } from './photos.repository';
import { SharedModule } from '../shared/shared.module';
import { CaslModule } from '../casl/casl.module';
import { PhotoLikesRepository } from './photo-likes.repository';
import { PhotoCommentsController } from './comments/photo-comments.controller';
import { PhotoCommentsRepository } from './comments/photo-comments.repository';
import { PhotoCommentsService } from './comments/photo-comments.service';
import { IPhotoCommentsRepository } from '@app/interfaces/photo-comments-repository.interface';
import { IPhotoLikesRepository } from '@app/interfaces/photo-likes-repository.interface';
import { IPhotosRepository } from '@app/interfaces/photos-repository.interface';

@Module({
  imports: [SharedModule, CaslModule],
  controllers: [PhotosController, PhotoCommentsController],
  providers: [
    PhotosService,
    PhotosRepository,
    { provide: IPhotosRepository, useExisting: PhotosRepository },
    PhotoLikesRepository,
    { provide: IPhotoLikesRepository, useExisting: PhotoLikesRepository },
    PhotoCommentsService,
    PhotoCommentsRepository,
    { provide: IPhotoCommentsRepository, useExisting: PhotoCommentsRepository },
  ],
  exports: [PhotosRepository, IPhotosRepository],
})
export class PhotosModule {}
