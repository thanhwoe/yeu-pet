import { accounts, photos } from '@app/generated/prisma/client';

export const IPhotosRepository = Symbol('IPhotosRepository');

export type PhotoWithAccount = photos & {
  accounts: Pick<accounts, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
};

export interface IPhotosRepository {
  findById(id: string): Promise<photos | null>;
  create(
    data: Pick<photos, 'account_id' | 'caption' | 'is_private' | 'status'>,
  ): Promise<photos>;
  update(id: string, data: Partial<photos>): Promise<photos>;
  delete(id: string): Promise<photos>;
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
  }): Promise<[PhotoWithAccount[], number]>;
  findAllPublic(params?: {
    skip?: number;
    take?: number;
  }): Promise<[PhotoWithAccount[], number]>;
  upsertPhotoView(account_id: string, photo_id: string): Promise<photos>;
}
