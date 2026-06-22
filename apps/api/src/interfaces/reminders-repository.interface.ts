import { reminders } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';
import { remindersWhereInput } from '@app/generated/prisma/models';

export const IRemindersRepository = Symbol('IRemindersRepository');

export interface IRemindersRepository extends IBaseRepository<reminders> {
  findMany(params: { where: remindersWhereInput }): Promise<reminders[]>;
  claimForNotification(id: string): Promise<boolean>;
}
