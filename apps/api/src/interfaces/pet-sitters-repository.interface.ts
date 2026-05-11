import {
  accounts,
  pet_sitters,
  PrismaClient,
} from '@app/generated/prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

export type PetSittersCreate = Pick<
  pet_sitters,
  'account_id' | 'bio' | 'address' | 'hourly_rate' | 'daily_rate'
>;

type PetSitterClient = pet_sitters & {
  accounts: Pick<accounts, 'avatar_url' | 'first_name' | 'last_name'>;
};

export interface IPetSittersRepository {
  findByUser(account_id: string): Promise<pet_sitters | null>;
  create(data: PetSittersCreate): Promise<pet_sitters>;
  update(id: string, data: Partial<pet_sitters>): Promise<pet_sitters>;
  findById(id: string): Promise<pet_sitters | null>;
  findAll(params?: {
    skip?: number;
    take?: number;
    address?: string;
  }): Promise<[PetSitterClient[], number]>;
  lock(
    tx: Omit<PrismaClient, ITXClientDenyList>,
    sitter_id: string,
  ): Promise<Pick<
    pet_sitters,
    'id' | 'active_bookings_count' | 'max_concurrent_bookings'
  > | null>;
}
