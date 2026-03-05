import { accounts, photo_comments } from '@app/generated/prisma/client';

type PhotoCommentsClient = photo_comments & {
  accounts: Pick<accounts, 'avatar_url' | 'first_name' | 'last_name' | 'id'>;
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
  delete(id: string): Promise<photo_comments>;
  findById(id: string): Promise<photo_comments | null>;
}
