import { reminders } from '@app/generated/prisma/client';
import { remindersWhereInput } from '@app/generated/prisma/models';
import { IBaseRepository } from './repository.interface';

export const IRemindersRepository = Symbol('IRemindersRepository');

export interface IRemindersRepository extends IBaseRepository<reminders> {
  findMany(params: { where: remindersWhereInput }): Promise<reminders[]>;
  claimForNotification(id: string): Promise<boolean>;
  deleteIfAllowed(id: string): Promise<boolean>;
}
