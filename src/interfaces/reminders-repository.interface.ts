import { reminders } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export type IRemindersRepository = IBaseRepository<reminders>;
