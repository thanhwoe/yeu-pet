import { pets } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export const IPetsRepository = Symbol('IPetsRepository');

export interface IPetsRepository extends IBaseRepository<pets> {
  findByUser(account_id: string, id: string): Promise<pets | null>;
}
