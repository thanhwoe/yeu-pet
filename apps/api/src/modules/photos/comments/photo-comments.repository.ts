import { PrismaService } from '@app/database/prisma/prisma.service';
import { photo_comments } from '@app/generated/prisma/client';
import { photo_commentsWhereInput } from '@app/generated/prisma/models';
import { IPhotoCommentsRepository } from '@app/interfaces/photo-comments-repository.interface';
import { Injectable } from '@nestjs/common';

const COMMENT_ACCOUNT_INCLUDE = {
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
export class PhotoCommentsRepository implements IPhotoCommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Pick<
      photo_comments,
      'account_id' | 'content' | 'parent_id' | 'photo_id'
    >,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.photo_comments.create({
        data,
        include: COMMENT_ACCOUNT_INCLUDE,
      });

      if (data.parent_id) {
        const replyCount = await tx.photo_comments.count({
          where: {
            parent_id: data.parent_id,
            deleted_at: null,
          },
        });

        await tx.photo_comments.update({
          where: { id: data.parent_id },
          data: {
            reply_count: replyCount,
            updated_at: new Date(),
          },
        });
      }

      const commentCount = await tx.photo_comments.count({
        where: {
          photo_id: data.photo_id,
          deleted_at: null,
        },
      });

      await tx.photos.update({
        where: { id: data.photo_id },
        data: {
          comment_count: commentCount,
          updated_at: new Date(),
        },
      });

      return comment;
    });
  }
  delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.photo_comments.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (comment.parent_id) {
        const replyCount = await tx.photo_comments.count({
          where: {
            parent_id: comment.parent_id,
            deleted_at: null,
          },
        });

        await tx.photo_comments.update({
          where: { id: comment.parent_id },
          data: {
            reply_count: replyCount,
            updated_at: new Date(),
          },
        });
      }

      const commentCount = await tx.photo_comments.count({
        where: {
          photo_id: comment.photo_id,
          deleted_at: null,
        },
      });

      await tx.photos.update({
        where: { id: comment.photo_id },
        data: {
          comment_count: commentCount,
          updated_at: new Date(),
        },
      });

      return comment;
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
        include: COMMENT_ACCOUNT_INCLUDE,
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
      photo_id: params?.photo_id,
      parent_id: params?.parent_id,
      deleted_at: null,
    };

    return this.prisma.$transaction([
      this.prisma.photo_comments.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'asc' },
        include: COMMENT_ACCOUNT_INCLUDE,
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
