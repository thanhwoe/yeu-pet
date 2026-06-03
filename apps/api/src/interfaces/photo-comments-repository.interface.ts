import { accounts, photo_comments, photos } from '@app/generated/prisma/client';

export const IPhotoCommentsRepository = Symbol('IPhotoCommentsRepository');

type PhotoCommentsClient = photo_comments & {
  accounts: Pick<accounts, 'avatar_url' | 'first_name' | 'last_name' | 'id'>;
};

export type DeletedPhotoCommentResult = {
  comment: photo_comments;
  photo: photos;
  reply_count?: number;
};

export interface IPhotoCommentsRepository {
  findAll(params?: {
    skip?: number;
    take?: number;
    photo_id: string;
  }): Promise<[PhotoCommentsClient[], number]>;
  create(
    data: Pick<
      PhotoCommentsClient,
      'account_id' | 'content' | 'parent_id' | 'photo_id'
    >,
  ): Promise<PhotoCommentsClient>;
  findAllReplies(params?: {
    skip?: number;
    take?: number;
    photo_id: string;
    parent_id: string;
  }): Promise<[PhotoCommentsClient[], number]>;
  delete(id: string): Promise<DeletedPhotoCommentResult>;
  findById(id: string): Promise<photo_comments | null>;
}
