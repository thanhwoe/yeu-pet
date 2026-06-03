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
} as const;

@Injectable()
export class PhotosRepository implements IPhotosRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Pick<photos, 'account_id' | 'caption' | 'is_private' | 'status'>,
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
    return this.prisma.photos.delete({
      where: { id },
    });
  }
  findAllPublic(params?: { skip?: number; take?: number }) {
    return this.prisma.$transaction([
      this.prisma.photos.findMany({
        where: {
          status: photos_status.ready,
          is_private: false,
        },
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
        include: PHOTO_ACCOUNT_INCLUDE,
      }),
      this.prisma.photos.count({
        where: { status: photos_status.ready, is_private: false },
      }),
    ]);
  }
  findAllByUser(params?: { skip?: number; take?: number; account_id: string }) {
    return this.prisma.$transaction([
      this.prisma.photos.findMany({
        where: {
          account_id: params?.account_id,
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

          status: {
            not: photos_status.failed,
          },
        },
      }),
    ]);
  }
  findById(id: string) {
    return this.prisma.photos.findUnique({
      where: { id },
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

        return tx.photos.findUniqueOrThrow({
          where: { id: photo_id },
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
}
