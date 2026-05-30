import { Module } from '@nestjs/common';
import { PhotoCommentsService } from './photo-comments.service';
import { PhotoCommentsController } from './photo-comments.controller';
import { PhotoCommentsRepository } from './photo-comments.repository';
import { PhotosModule } from '../photos/photos.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [PhotosModule, CaslModule],
  controllers: [PhotoCommentsController],
  providers: [PhotoCommentsService, PhotoCommentsRepository],
})
export class PhotoCommentsModule {}
