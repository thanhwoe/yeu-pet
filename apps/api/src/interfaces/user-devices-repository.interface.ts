import { account_devices } from '@app/generated/prisma/client';

export interface IUserDevicesRepository {
  create(
    data: Pick<
      account_devices,
      | 'account_id'
      | 'device_name'
      | 'installation_id'
      | 'os_version'
      | 'platform'
      | 'push_token'
      | 'registration_generation'
    >,
  ): Promise<account_devices>;
  findByPushToken(pushToken: string): Promise<account_devices | null>;
  findActiveByAccountId(accountId: string): Promise<account_devices[]>;
  findActiveOwnedDevice(params: {
    id: string;
    accountId: string;
    pushToken: string;
  }): Promise<account_devices | null>;
  deactivateOwned(id: string, accountId: string): Promise<number>;
  deactivateIfTokenMatches(id: string, pushToken: string): Promise<number>;
}
