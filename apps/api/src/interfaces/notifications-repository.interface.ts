import { notifications } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';
import { BatchPayload } from '@app/generated/prisma/internal/prismaNamespace';

export interface INotificationsRepository extends IBaseRepository<notifications> {
  countBadge(account_id: string): Promise<number>;
  updateMany(
    account_id: string,
    data: Partial<notifications>,
  ): Promise<BatchPayload>;
  updateManyUnRead(
    account_id: string,
    data: Partial<notifications>,
  ): Promise<BatchPayload>;
}
