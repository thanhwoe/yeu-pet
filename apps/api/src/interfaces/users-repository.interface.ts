import { accounts } from '@app/generated/prisma/client';

type AccountPrivate = Omit<accounts, 'password_hash'>;

type AccountPublic = Pick<
  accounts,
  | 'id'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'is_verified'
  | 'avatar_url'
  | 'onboarding_completed'
  | 'phone'
  | 'role'
  | 'subscription'
  | 'subscription_expires_at'
>;

export interface IUsersRepository {
  findByEmail(email: string): Promise<AccountPrivate | null>;
  findByPhone(phone: string): Promise<AccountPrivate | null>;
  findByEmailOrPhone(identifier: string): Promise<AccountPrivate | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
  findAccount(id: string): Promise<accounts | null>;
  findById(id: string): Promise<AccountPrivate | null>;
  findAll?(params?: any): Promise<AccountPrivate[]>;
  create(data: any): Promise<AccountPrivate>;
  update?(id: string, data: Partial<accounts>): Promise<AccountPublic>;
  delete(id: string): Promise<AccountPrivate>;
}
