import { accounts, photos } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export interface IPhotosRepository extends IBaseRepository<photos> {
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
  }): Promise<[photos[], number]>;
  findAllPublic(params?: { skip?: number; take?: number }): Promise<
    [
      (photos & {
        accounts: Pick<
          accounts,
          'id' | 'first_name' | 'last_name' | 'avatar_url'
        >;
      })[],
      number,
    ]
  >;
  upsertPhotoView(account_id: string, photo_id: string): Promise<photos>;
}
