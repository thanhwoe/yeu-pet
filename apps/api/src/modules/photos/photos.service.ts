import {
  Inject,
  Injectable,
  MessageEvent,
  NotFoundException,
} from '@nestjs/common';
import { CreatePhotoDto, type BooleanFormValue } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { accounts, photos, photos_status } from '@app/generated/prisma/client';
import { Observable } from 'rxjs';
import { photoChannel, photoLastMessage, UploadEvent } from './photos.event';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { FILE_DELETE_JOBS } from '../file-workers/file-workers.job';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import { ICacheService } from '@app/interfaces/cache.interface';
import { IPhotoLikesRepository } from '@app/interfaces/photo-likes-repository.interface';
import {
  IPhotosRepository,
  PhotoWithAccount,
} from '@app/interfaces/photos-repository.interface';
import { assertOwnerOrAdmin, isOwnerOrAdmin } from '@app/utils/ownership';

const toBoolean = (value: BooleanFormValue): boolean =>
  value === true || value === 'true' || value === '1';

type PhotoResponse = (photos | PhotoWithAccount) & {
  comments: number;
  liked?: boolean;
  likes: number;
  views: number;
};

@Injectable()
export class PhotosService {
  constructor(
    @Inject(IPhotosRepository)
    private readonly photosRepository: IPhotosRepository,
    @Inject(IPhotoLikesRepository)
    private readonly photoLikesRepository: IPhotoLikesRepository,
    private readonly fileUploadService: FileUploadService,
    @Inject(IEventBusService)
    private readonly eventBusService: IEventBusService,
    @Inject(ICacheService)
    private readonly cacheService: ICacheService,
  ) {}
  async create(
    user: accounts,
    createPhotoDto: CreatePhotoDto,
    file: Express.Multer.File,
  ) {
    const photo = await this.photosRepository.create({
      account_id: user.id,
      caption: createPhotoDto.caption,
      is_private: toBoolean(createPhotoDto.isPrivate),
      status: photos_status.pending,
    });
    await this.fileUploadService.addPhotoJob({
      jobName: 'photos',
      files: [
        {
          file,
          folder: `photos/${photo.id}`,
        },
      ],
      itemId: photo.id,
    });
    return photo;
  }

  async getUploadStatus(id: string) {
    const photo = await this.photosRepository.findById(id);
    if (!photo) {
      throw new NotFoundException('No photo');
    }

    if (photo.status === photos_status.ready) {
      return this.terminalObservable({
        type: photos_status.ready,
        id,
      });
    }

    if (photo.status === photos_status.failed) {
      return this.terminalObservable({
        type: photos_status.failed,
        id,
      });
    }

    return new Observable<MessageEvent>((subscriber) => {
      let unsubscribe: (() => Promise<void>) | null = null;
      const channel = photoChannel(id);

      this.eventBusService
        .subscribe(
          channel,
          (msg: UploadEvent) => {
            subscriber.next({ data: msg });

            // Close the stream once the job reaches a terminal state
            if (
              msg.type === photos_status.ready ||
              msg.type === photos_status.failed
            ) {
              subscriber.complete();
            }
          },
          (err) => {
            subscriber.error(err);
          },
        )
        .then((fn) => {
          unsubscribe = fn;

          return this.cacheService.get<UploadEvent>(photoLastMessage(id));
        })
        .then((lastMsg) => {
          if (!lastMsg || subscriber.closed) {
            return;
          }
          subscriber.next({ data: lastMsg });

          if (
            lastMsg.type === photos_status.ready ||
            lastMsg.type === photos_status.failed
          ) {
            subscriber.complete();
          }
        })
        .catch((err) => {
          subscriber.error(err);
        });

      // Heartbeat timer — keeps the HTTP connection alive through proxies
      // that close idle connections.
      const heartbeat = setInterval(() => {
        if (!subscriber.closed) {
          subscriber.next({ data: { type: 'heartbeat' } });
        }
      }, 15_000);

      // Safety timeout — close orphaned connections after 5 minutes
      const timeout = setTimeout(
        () => {
          subscriber.complete();
        },
        5 * 60 * 1000,
      );

      // Cleanup
      return () => {
        clearInterval(heartbeat);
        clearTimeout(timeout);
        unsubscribe?.().catch(() => {});
      };
    });
  }

  // Emits one event and immediately completes
  private terminalObservable(event: UploadEvent): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      subscriber.next({ data: event });
      subscriber.complete();
    });
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.photosRepository.findAllPublic({
      skip,
      take: limit,
    });

    return paginate(
      data.map((photo) => this.toPhotoResponse(photo)),
      total,
      page,
      limit,
    );
  }

  async findAllByUser(user: accounts, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.photosRepository.findAllByUser({
      skip,
      take: limit,
      account_id: user.id,
    });

    return paginate(
      data.map((photo) => this.toPhotoResponse(photo)),
      total,
      page,
      limit,
    );
  }

  async findOne(user: accounts, id: string) {
    const photo = await this.assertReadable(user, id);

    const liked = await this.photoLikesRepository.findOne(user.id, id);

    // TODO: Set timer for counter view
    const updatedPhoto = await this.photosRepository.upsertPhotoView(
      user.id,
      photo.id,
    );

    return this.toPhotoResponse(updatedPhoto, Boolean(liked));
  }

  async toggleLike(user: accounts, id: string) {
    await this.assertReadable(user, id);

    const { liked, photo } = await this.photoLikesRepository.toggle(
      user.id,
      id,
    );

    return this.toPhotoResponse(photo, liked);
  }

  async update(user: accounts, id: string, updatePhotoDto: UpdatePhotoDto) {
    await this.assertOwner(user, id);

    return this.photosRepository.update(id, {
      caption: updatePhotoDto.caption,
      ...(updatePhotoDto.isPrivate === undefined
        ? {}
        : { is_private: toBoolean(updatePhotoDto.isPrivate) }),
    });
  }

  async remove(user: accounts, id: string) {
    const photo = await this.assertOwner(user, id);

    if (photo.file_id) {
      await this.fileUploadService.addDeleteJob({
        ids: [photo.file_id],
        jobName: FILE_DELETE_JOBS.PHOTOS,
      });
    }

    await this.photosRepository.delete(id);
  }

  private async findAvailablePhoto(id: string) {
    const record = await this.photosRepository.findById(id);

    if (!record) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    if (record.status !== photos_status.ready) {
      throw new NotFoundException('Photo not available');
    }

    return record;
  }

  private async assertReadable(user: accounts, id: string) {
    const record = await this.findAvailablePhoto(id);

    if (record.is_private && !isOwnerOrAdmin(user, record.account_id)) {
      throw new NotFoundException('Photo not available');
    }

    return record;
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.findAvailablePhoto(id);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }

  private toPhotoResponse(
    photo: photos | PhotoWithAccount,
    liked?: boolean,
  ): PhotoResponse {
    return {
      ...photo,
      comments: photo.comment_count,
      liked,
      likes: photo.like_count,
      views: photo.view_count,
    };
  }
}
