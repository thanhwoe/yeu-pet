import { PrismaService } from '@app/database/prisma/prisma.service';
import { IPhotoLikesRepository } from '@app/interfaces/photo-likes-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PhotoLikesRepository implements IPhotoLikesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOne(account_id: string, photo_id: string) {
    return this.prisma.photo_likes.findUnique({
      where: {
        photo_id_account_id: { photo_id, account_id },
      },
    });
  }

  like(account_id: string, photo_id: string) {
    return this.setLiked(account_id, photo_id, true);
  }

  unlike(account_id: string, photo_id: string) {
    return this.setLiked(account_id, photo_id, false);
  }

  async toggle(account_id: string, photo_id: string) {
    const existingLike = await this.findOne(account_id, photo_id);
    return this.setLiked(account_id, photo_id, !existingLike);
  }

  private setLiked(account_id: string, photo_id: string, shouldLike: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.photo_likes.findUnique({
        where: {
          photo_id_account_id: { photo_id, account_id },
        },
      });

      if (shouldLike && !existingLike) {
        await tx.photo_likes.create({
          data: {
            account_id,
            photo_id,
          },
        });
      }

      if (!shouldLike && existingLike) {
        await tx.photo_likes.delete({
          where: {
            photo_id_account_id: { photo_id, account_id },
          },
        });
      }

      const likeCount = await tx.photo_likes.count({
        where: {
          photo_id,
        },
      });

      const photo = await tx.photos.update({
        where: { id: photo_id },
        data: {
          like_count: likeCount,
          updated_at: new Date(),
        },
      });

      return {
        liked: shouldLike,
        photo,
      };
    });
  }
}
