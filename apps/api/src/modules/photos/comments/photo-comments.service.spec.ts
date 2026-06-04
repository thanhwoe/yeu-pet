import { photos_status } from '@app/generated/prisma/client';
import { IPhotoCommentsRepository } from '@app/interfaces/photo-comments-repository.interface';
import { IPhotosRepository } from '@app/interfaces/photos-repository.interface';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PhotoCommentsService } from './photo-comments.service';

describe('PhotoCommentsService', () => {
  const photoCommentsRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
  };
  const photosRepository = {
    findById: jest.fn(),
  };

  let service: PhotoCommentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PhotoCommentsService,
        {
          provide: IPhotoCommentsRepository,
          useValue: photoCommentsRepository,
        },
        {
          provide: IPhotosRepository,
          useValue: photosRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(PhotoCommentsService);
  });

  const readyPublicPhoto = {
    id: 'photo-1',
    account_id: 'owner-1',
    is_private: false,
    status: photos_status.ready,
  };

  it('creates replies from the route comment id', async () => {
    photosRepository.findById.mockResolvedValue(readyPublicPhoto);
    photoCommentsRepository.findById.mockResolvedValue({
      id: 'comment-1',
      photo_id: 'photo-1',
      parent_id: null,
      deleted_at: null,
    });
    photoCommentsRepository.create.mockResolvedValue({ id: 'reply-1' });

    await service.reply({ id: 'account-1' } as never, 'photo-1', 'comment-1', {
      content: 'Same here',
      parentId: 'ignored-body-parent',
    });

    expect(photoCommentsRepository.create).toHaveBeenCalledWith({
      account_id: 'account-1',
      content: 'Same here',
      parent_id: 'comment-1',
      photo_id: 'photo-1',
    });
  });

  it('rejects nested replies beyond one level', async () => {
    photosRepository.findById.mockResolvedValue(readyPublicPhoto);
    photoCommentsRepository.findById.mockResolvedValue({
      id: 'reply-1',
      photo_id: 'photo-1',
      parent_id: 'comment-1',
      deleted_at: null,
    });

    await expect(
      service.reply({ id: 'account-1' } as never, 'photo-1', 'reply-1', {
        content: 'Nested',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows the photo owner to delete comments from other accounts', async () => {
    photosRepository.findById.mockResolvedValue(readyPublicPhoto);
    photoCommentsRepository.findById.mockResolvedValue({
      id: 'comment-1',
      account_id: 'commenter-1',
      photo_id: 'photo-1',
      parent_id: null,
      deleted_at: null,
    });
    photoCommentsRepository.delete.mockResolvedValue({
      comment: { id: 'comment-1' },
      photo: {
        id: 'photo-1',
        comment_count: 0,
        like_count: 0,
        view_count: 0,
      },
    });

    const result = await service.remove(
      { id: 'owner-1' } as never,
      'comment-1',
      'photo-1',
    );

    expect(photoCommentsRepository.delete).toHaveBeenCalledWith('comment-1');
    expect(result.photo).toMatchObject({
      comments: 0,
      likes: 0,
      views: 0,
    });
  });
});
