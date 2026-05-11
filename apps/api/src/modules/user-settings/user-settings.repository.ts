import { PrismaService } from '@app/database/prisma/prisma.service';
import { account_settings } from '@app/generated/prisma/client';
import { IUserSettingsRepository } from '@app/interfaces/user-settings-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSettingsRepository implements IUserSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.account_settings.findUnique({
      where: {
        account_id: id,
      },
    });
  }

  async upsert(id: string, data: Partial<account_settings>) {
    return this.prisma.account_settings.upsert({
      where: {
        account_id: id,
      },
      create: {
        account_id: id,
      },
      update: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
}
