import { accounts, pets, photos, reports } from '@app/generated/prisma/client';

export const IPhotosRepository = Symbol('IPhotosRepository');

export type PhotoWithAccount = photos & {
  accounts: Pick<accounts, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  pets?: Pick<pets, 'id' | 'name' | 'avatar_url'> | null;
};

export interface IPhotosRepository {
  findById(id: string): Promise<photos | null>;
  create(
    data: Pick<
      photos,
      'account_id' | 'caption' | 'is_private' | 'pet_id' | 'status'
    >,
  ): Promise<photos>;
  update(id: string, data: Partial<photos>): Promise<photos>;
  delete(id: string): Promise<photos>;
  findAllByUser(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    visibility?: 'all' | 'public' | 'private';
  }): Promise<[PhotoWithAccount[], number]>;
  findAllPublic(params?: {
    skip?: number;
    take?: number;
  }): Promise<[PhotoWithAccount[], number]>;
  report(params: {
    reporter_account_id: string;
    photo_id: string;
    reason: string;
    description?: string;
  }): Promise<reports>;
  upsertPhotoView(account_id: string, photo_id: string): Promise<photos>;
}
