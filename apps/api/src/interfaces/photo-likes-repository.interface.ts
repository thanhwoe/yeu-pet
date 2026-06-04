import { photo_likes, photos } from '@app/generated/prisma/client';

export const IPhotoLikesRepository = Symbol('IPhotoLikesRepository');

export interface IPhotoLikesRepository {
  findOne(account_id: string, photo_id: string): Promise<photo_likes | null>;
  like(
    account_id: string,
    photo_id: string,
  ): Promise<{ liked: boolean; photo: photos }>;
  unlike(
    account_id: string,
    photo_id: string,
  ): Promise<{ liked: boolean; photo: photos }>;
  toggle(
    account_id: string,
    photo_id: string,
  ): Promise<{ liked: boolean; photo: photos }>;
}
