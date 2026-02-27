import { account_settings } from '@app/generated/prisma/client';

export interface IUserSettingsRepository {
  findById(id: string): Promise<account_settings | null>;
  upsert(
    id: string,
    data: Partial<account_settings>,
  ): Promise<account_settings>;
}
