import { Injectable, Logger } from '@nestjs/common';
import { accounts } from '@app/generated/prisma/client';
import { IUsersRepository } from '@app/interfaces/users-repository.interface';
import { PrismaService } from '@app/database/prisma/prisma.service';

const ACCOUNT_PUBLIC_SELECT = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  onboarding_completed: true,
  avatar_url: true,
  role: true,
  subscription: true,
  subscription_expires_at: true,
  is_active: true,
  is_verified: true,
} as const;

@Injectable()
export class UsersRepository implements IUsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.accounts.findUnique({
      where: { id },
      select: ACCOUNT_PUBLIC_SELECT,
    });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    return this.prisma.accounts.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }

  async findAccount(id: string) {
    return this.prisma.accounts.findUnique({
      where: { id },
      omit: {
        password_hash: false,
      },
    });
  }

  async create(
    data: Pick<
      accounts,
      'phone' | 'password_hash' | 'first_name' | 'last_name' | 'email'
    >,
  ): Promise<accounts> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.accounts.create({ data });

      await tx.account_settings.create({
        data: {
          account_id: user.id,
        },
      });
      return user;
    });
  }

  async update(id: string, data: Partial<accounts>) {
    return this.prisma.accounts.update({
      where: { id },
      select: ACCOUNT_PUBLIC_SELECT,
      data,
    });
  }

  async delete(id: string): Promise<accounts> {
    // Soft delete
    return this.prisma.accounts.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async findByEmail(email: string): Promise<accounts | null> {
    if (!email) return null;

    return this.prisma.accounts.findUnique({
      where: { email: email.toLowerCase() },
      omit: {
        password_hash: false,
      },
    });
  }

  async findByPhone(phone: string): Promise<accounts | null> {
    if (!phone) return null;

    return this.prisma.accounts.findUnique({
      where: { phone },
      omit: {
        password_hash: false,
      },
    });
  }

  async findByEmailOrPhone(identifier: string): Promise<accounts | null> {
    // Check if identifier is email (contains @)
    const isEmail = identifier.includes('@');

    if (isEmail) {
      return this.findByEmail(identifier);
    }

    return this.findByPhone(identifier);
  }

  async existsByEmail(email: string): Promise<boolean> {
    if (!email) return false;

    const count = await this.prisma.accounts.count({
      where: { email: email.toLowerCase() },
    });

    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    if (!phone) return false;

    const count = await this.prisma.accounts.count({
      where: { phone },
    });

    return count > 0;
  }
}
