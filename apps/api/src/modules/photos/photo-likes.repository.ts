import { PrismaService } from '@app/database/prisma/prisma.service';
import { IPhotoLikesRepository } from '@app/interfaces/photo-likes-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PhotoLikesRepository implements IPhotoLikesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(account_id: string, photo_id: string) {
    return this.prisma.photo_likes.create({
      data: {
        account_id,
        photo_id,
      },
    });
  }
  delete(account_id: string, photo_id: string) {
    return this.prisma.photo_likes.delete({
      where: {
        photo_id_account_id: { photo_id, account_id },
      },
    });
  }
  findOne(account_id: string, photo_id: string) {
    return this.prisma.photo_likes.findUnique({
      where: {
        photo_id_account_id: { photo_id, account_id },
      },
    });
  }
}
