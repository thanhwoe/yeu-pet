import { PrismaService } from '@app/database/prisma/prisma.service';
import { photos } from '@app/generated/prisma/client';
import { photos_status } from '@app/generated/prisma/enums';
import { IPhotosRepository } from '@app/interfaces/photos-repository.interface';
import { Injectable } from '@nestjs/common';

const PHOTO_ACCOUNT_INCLUDE = {
  accounts: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      avatar_url: true,
    },
  },
  pets: {
    select: {
      id: true,
      name: true,
      avatar_url: true,
    },
  },
} as const;

@Injectable()
export class PhotosRepository implements IPhotosRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Pick<
      photos,
      'account_id' | 'caption' | 'is_private' | 'pet_id' | 'status'
    >,
  ) {
    return this.prisma.photos.create({
      data,
    });
  }
  update(id: string, data: Partial<photos>) {
    return this.prisma.photos.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  delete(id: string) {
    return this.prisma.photos.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
  findAllPublic(params?: {
    skip?: number;
    take?: number;
    viewer_account_id?: string;
  }) {
    const blockedWhere = this.blockedAccountWhere(params?.viewer_account_id);

    return this.prisma.$transaction([
      this.prisma.photos.findMany({
        where: {
          status: photos_status.ready,
          is_private: false,
          deleted_at: null,
          ...blockedWhere,
        },
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
        include: PHOTO_ACCOUNT_INCLUDE,
      }),
      this.prisma.photos.count({
        where: {
          status: photos_status.ready,
          is_private: false,
          deleted_at: null,
          ...blockedWhere,
        },
      }),
    ]);
  }
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    visibility?: 'all' | 'public' | 'private';
  }) {
    const visibilityWhere =
      params?.visibility === 'public'
        ? { is_private: false }
        : params?.visibility === 'private'
          ? { is_private: true }
          : {};

    return this.prisma.$transaction([
      this.prisma.photos.findMany({
        where: {
          account_id: params?.account_id,
          deleted_at: null,
          ...visibilityWhere,
          status: {
            not: photos_status.failed,
          },
        },
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
        include: PHOTO_ACCOUNT_INCLUDE,
      }),
      this.prisma.photos.count({
        where: {
          account_id: params?.account_id,
          deleted_at: null,
          ...visibilityWhere,
          status: {
            not: photos_status.failed,
          },
        },
      }),
    ]);
  }
  findById(id: string) {
    return this.prisma.photos.findFirst({
      where: { id, deleted_at: null },
    });
  }
  upsertPhotoView(account_id: string, photo_id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existingView = await tx.photo_views.findUnique({
        where: {
          photo_id_account_id: { photo_id, account_id },
        },
      });

      if (existingView) {
        await tx.photo_views.update({
          where: {
            photo_id_account_id: { photo_id, account_id },
          },
          data: {
            view_at: new Date(),
            updated_at: new Date(),
          },
        });

        return tx.photos.findFirstOrThrow({
          where: { id: photo_id, deleted_at: null },
        });
      }

      await tx.photo_views.create({
        data: {
          photo_id,
          account_id,
        },
      });

      return tx.photos.update({
        where: { id: photo_id },
        data: {
          view_count: { increment: 1 },
        },
      });
    });
  }

  private blockedAccountWhere(viewerAccountId?: string) {
    if (!viewerAccountId) {
      return {};
    }

    return {
      NOT: [
        {
          accounts: {
            user_blocks_blocker: {
              some: { blocked_account_id: viewerAccountId },
            },
          },
        },
        {
          accounts: {
            user_blocks_blocked: {
              some: { blocker_account_id: viewerAccountId },
            },
          },
        },
      ],
    };
  }
}
