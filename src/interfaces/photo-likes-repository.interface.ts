import { photo_likes } from '@app/generated/prisma/client';

export interface IPhotoLikesRepository {
  findOne(account_id: string, photo_id: string): Promise<photo_likes | null>;
  create(account_id: string, photo_id: string): Promise<photo_likes>;
  delete(account_id: string, photo_id: string): Promise<photo_likes>;
}
