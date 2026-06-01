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

@Module({
  imports: [SharedModule, CaslModule],
  controllers: [PhotosController, PhotoCommentsController],
  providers: [
    PhotosService,
    PhotosRepository,
    PhotoLikesRepository,
    PhotoCommentsService,
    PhotoCommentsRepository,
  ],
  exports: [PhotosRepository],
})
export class PhotosModule {}
