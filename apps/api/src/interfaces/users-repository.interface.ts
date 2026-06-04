import { accounts } from '@app/generated/prisma/client';

export const IUsersRepository = Symbol('IUsersRepository');

type AccountPublic = Pick<
  accounts,
  | 'id'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'is_active'
  | 'is_verified'
  | 'avatar_url'
  | 'onboarding_completed'
  | 'phone'
  | 'role'
  | 'subscription'
  | 'subscription_expires_at'
>;

export interface IUsersRepository {
  findByEmail(email: string): Promise<accounts | null>;
  findByPhone(phone: string): Promise<accounts | null>;
  findByEmailOrPhone(identifier: string): Promise<accounts | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
  findAccount(id: string): Promise<accounts | null>;
  findById(id: string): Promise<AccountPublic | null>;
  findAll(params?: any): Promise<accounts[]>;
  create(data: any): Promise<accounts>;
  update(id: string, data: Partial<accounts>): Promise<AccountPublic>;
  delete(id: string): Promise<accounts>;
}
