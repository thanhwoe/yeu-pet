import { photo_likes, photos } from '@app/generated/prisma/client';

export const IPhotoLikesRepository = Symbol('IPhotoLikesRepository');

export interface IPhotoLikesRepository {
  findOne(account_id: string, photo_id: string): Promise<photo_likes | null>;
  create(account_id: string, photo_id: string): Promise<photo_likes>;
  delete(account_id: string, photo_id: string): Promise<photo_likes>;
  toggle(
    account_id: string,
    photo_id: string,
  ): Promise<{ liked: boolean; photo: photos }>;
}
