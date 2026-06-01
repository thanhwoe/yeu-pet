import { PrismaService } from '@app/database/prisma/prisma.service';
import { photo_comments } from '@app/generated/prisma/client';
import { photo_commentsWhereInput } from '@app/generated/prisma/models';
import { IPhotoCommentsRepository } from '@app/interfaces/photo-comments-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PhotoCommentsRepository implements IPhotoCommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Pick<
      photo_comments,
      'account_id' | 'content' | 'parent_id' | 'photo_id'
    >,
  ) {
    return this.prisma.photo_comments.create({
      data,
      include: {
        accounts: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
    });
  }
  delete(id: string) {
    return this.prisma.photo_comments.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
  findAll(params?: { skip?: number; take?: number; photo_id: string }) {
    const where: photo_commentsWhereInput = {
      photo_id: params?.photo_id,
      parent_id: null,
      deleted_at: null,
    };

    return this.prisma.$transaction([
      this.prisma.photo_comments.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'asc' },
        include: {
          accounts: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.photo_comments.count({
        where,
      }),
    ]);
  }
  findAllReplies(params?: {
    skip?: number;
    take?: number;
    photo_id: string;
    parent_id: string;
  }) {
    const where: photo_commentsWhereInput = {
      parent_id: params?.parent_id,
      deleted_at: null,
    };

    return this.prisma.$transaction([
      this.prisma.photo_comments.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'asc' },
        include: {
          accounts: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.photo_comments.count({
        where,
      }),
    ]);
  }
  findById(id: string) {
    return this.prisma.photo_comments.findUnique({
      where: { id },
    });
  }
}
