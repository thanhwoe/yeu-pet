import { account_devices } from '@app/generated/prisma/client';
import { IBaseRepository } from './repository.interface';

export interface IUserDevicesRepository extends IBaseRepository<account_devices> {
  findByPushToken(pushToken: string): Promise<account_devices | null>;
}
