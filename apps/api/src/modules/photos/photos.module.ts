import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { PhotosRepository } from './photos.repository';
import { SharedModule } from '../shared/shared.module';
import { CaslModule } from '../casl/casl.module';
import { PhotoLikesRepository } from './photo-likes.repository';

@Module({
  imports: [SharedModule, CaslModule],
  controllers: [PhotosController],
  providers: [PhotosService, PhotosRepository, PhotoLikesRepository],
  exports: [PhotosRepository],
})
export class PhotosModule {}
