import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import {
  IFileUploadService,
  UploadJobData,
} from '@app/interfaces/file-upload.interface';
import Stream from 'stream';
import { BULLMQ_QUEUES } from '../shared/bullmq/bullmq.queue';
import { PhotosRepository } from '../photos/photos.repository';
import { photos_status } from '@app/generated/prisma/enums';
import {
  photoChannel,
  photoLastMessage,
  UploadEvent,
} from '../photos/photos.event';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import { ICacheService } from '@app/interfaces/cache.interface';

@Processor(BULLMQ_QUEUES.PHOTO_UPLOAD, { concurrency: 3 })
export class PhotoUploadProcessor extends WorkerHost {
  constructor(
    @Inject(IFileUploadService)
    private readonly fileUploadService: IFileUploadService,
    @Inject(IEventBusService)
    private readonly eventBusService: IEventBusService,
    @Inject(ICacheService)
    private readonly cacheService: ICacheService,
    private readonly photosRepository: PhotosRepository,
  ) {
    super();
  }

  async process(job: Job<UploadJobData, any>): Promise<any> {
    const { files, itemId } = job.data;

    try {
      await this.photosRepository.update(itemId, {
        status: photos_status.processing,
      });
      await job.updateProgress(10);

      await this.publish(itemId, {
        type: photos_status.processing,
        id: itemId,
        progress: 10,
      });

      // Convert buffer back to Multer file format
      const payload = files.map(({ file, folder, id }) => ({
        file: {
          buffer: Buffer.from(file.buffer),
          originalname: file.originalname,
          mimetype: file.mimetype,
          fieldname: 'file',
          encoding: '7bit',
          size: file.buffer.length,
          stream: null as unknown as Stream.Readable,
          destination: '',
          filename: '',
          path: '',
        },
        folder,
        id,
      }));

      await this.publish(itemId, {
        type: photos_status.processing,
        id: itemId,
        progress: 30,
      });

      // Upload to Cloudinary
      const results = await Promise.all(
        payload.map((f) =>
          this.fileUploadService.uploadImage(f.file, f.folder, 'original'),
        ),
      );

      await this.publish(itemId, {
        type: photos_status.processing,
        id: itemId,
        progress: 70,
      });

      await this.photosRepository.update(itemId, {
        file_id: results[0].publicId,
        url: results[0].url,
        thumbnail_url: results[0].thumbnailUrl,
        status: photos_status.ready,
      });

      await this.publish(itemId, {
        type: photos_status.ready,
        id: itemId,
        progress: 100,
      });
      await job.updateProgress(100);

      return {
        success: true,
      };
    } catch (error) {
      await this.photosRepository.update(itemId, {
        status: photos_status.failed,
      });
      await this.publish(itemId, { type: 'failed', id: itemId });

      throw error;
    }
  }

  private async publish(id: string, event: UploadEvent): Promise<void> {
    await this.eventBusService.publish(photoChannel(id), event);
    await this.cacheService.set(photoLastMessage(id), event);
  }
}
