import { photos_status } from '@app/generated/prisma/client';
import { ICacheService } from '@app/interfaces/cache.interface';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import { IPhotoLikesRepository } from '@app/interfaces/photo-likes-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { IPhotosRepository } from '@app/interfaces/photos-repository.interface';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FileUploadService } from '../shared/file-upload/file-upload.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { ModerationService } from '../moderation/moderation.service';
import { PhotosService } from './photos.service';

describe('PhotosService', () => {
  const photosRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    upsertPhotoView: jest.fn(),
  };
  const photoLikesRepository = {
    findOne: jest.fn(),
    like: jest.fn(),
    unlike: jest.fn(),
    toggle: jest.fn(),
  };
  const petsRepository = {
    findByUser: jest.fn(),
  };
  const fileUploadService = {
    addPhotoJob: jest.fn(),
    addDeleteJob: jest.fn(),
  };
  const subscriptionService = {
    assertCanUploadPhoto: jest.fn(),
  };
  const moderationService = {
    createReport: jest.fn(),
  };

  let service: PhotosService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PhotosService,
        { provide: IPhotosRepository, useValue: photosRepository },
        { provide: IPhotoLikesRepository, useValue: photoLikesRepository },
        { provide: IPetsRepository, useValue: petsRepository },
        { provide: FileUploadService, useValue: fileUploadService },
        { provide: SubscriptionService, useValue: subscriptionService },
        { provide: ModerationService, useValue: moderationService },
        { provide: IEventBusService, useValue: {} },
        { provide: ICacheService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(PhotosService);
  });

  it('checks pet ownership and photo entitlement before creating uploads', async () => {
    petsRepository.findByUser.mockResolvedValue({
      id: 'pet-1',
      account_id: 'account-1',
    });
    photosRepository.create.mockResolvedValue({ id: 'photo-1' });

    await service.create(
      { id: 'account-1' } as never,
      {
        caption: 'Sunny nap',
        isPrivate: false,
        petId: 'pet-1',
      },
      { originalname: 'nap.png' } as Express.Multer.File,
    );

    expect(petsRepository.findByUser).toHaveBeenCalledWith(
      'account-1',
      'pet-1',
    );
    expect(subscriptionService.assertCanUploadPhoto).toHaveBeenCalledWith(
      'account-1',
    );
    expect(photosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: 'account-1',
        pet_id: 'pet-1',
        status: photos_status.pending,
      }),
    );
    expect(fileUploadService.addPhotoJob).toHaveBeenCalled();
  });

  it('unlikes photos idempotently after readability checks', async () => {
    photosRepository.findById.mockResolvedValue({
      id: 'photo-1',
      account_id: 'owner-1',
      deleted_at: null,
      is_private: false,
      status: photos_status.ready,
    });
    photoLikesRepository.unlike.mockResolvedValue({
      liked: false,
      photo: {
        id: 'photo-1',
        like_count: 0,
        comment_count: 0,
        view_count: 0,
      },
    });

    const result = await service.unlike(
      { id: 'account-1' } as never,
      'photo-1',
    );

    expect(photoLikesRepository.unlike).toHaveBeenCalledWith(
      'account-1',
      'photo-1',
    );
    expect(result).toMatchObject({
      liked: false,
      likes: 0,
    });
  });

  it('reports readable photos', async () => {
    photosRepository.findById.mockResolvedValue({
      id: 'photo-1',
      account_id: 'owner-1',
      deleted_at: null,
      is_private: false,
      status: photos_status.ready,
    });
    moderationService.createReport.mockResolvedValue({
      reported: true,
      report: { id: 'report-1' },
    });

    await expect(
      service.report({ id: 'account-1' } as never, 'photo-1', {
        reason: 'spam',
        description: 'Promotional content',
      }),
    ).resolves.toEqual({
      reported: true,
      report: { id: 'report-1' },
    });
    expect(moderationService.createReport).toHaveBeenCalledWith(
      { id: 'account-1' },
      expect.objectContaining({
        targetId: 'photo-1',
        targetType: 'photo',
      }),
    );
  });

  it('does not expose private photos owned by someone else', async () => {
    photosRepository.findById.mockResolvedValue({
      id: 'photo-1',
      account_id: 'owner-1',
      deleted_at: null,
      is_private: true,
      status: photos_status.ready,
    });

    await expect(
      service.like({ id: 'account-1' } as never, 'photo-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
