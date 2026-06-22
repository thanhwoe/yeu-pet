import { PrismaService } from '@app/database/prisma/prisma.service';
import { account_devices } from '@app/generated/prisma/client';
import { account_devicesWhereInput } from '@app/generated/prisma/models';
import { IUserDevicesRepository } from '@app/interfaces/user-devices-repository.interface';
import { Injectable } from '@nestjs/common';

export class StaleDeviceRegistrationError extends Error {
  constructor() {
    super('Stale device registration session');
    this.name = StaleDeviceRegistrationError.name;
  }
}

@Injectable()
export class UserDevicesRepository implements IUserDevicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Pick<
      account_devices,
      | 'device_name'
      | 'installation_id'
      | 'os_version'
      | 'platform'
      | 'push_token'
      | 'registration_generation'
      | 'account_id'
    >,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updatedAt = new Date();

      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${data.installation_id}))
      `;

      const latestRegistration = await tx.account_devices.findFirst({
        where: { installation_id: data.installation_id },
        orderBy: { registration_generation: 'desc' },
        select: {
          account_id: true,
          registration_generation: true,
        },
      });

      if (
        latestRegistration &&
        (data.registration_generation <
          latestRegistration.registration_generation ||
          (data.registration_generation ===
            latestRegistration.registration_generation &&
            data.account_id !== latestRegistration.account_id))
      ) {
        throw new StaleDeviceRegistrationError();
      }

      await tx.account_devices.updateMany({
        where: {
          installation_id: data.installation_id,
          is_active: true,
          push_token: { not: data.push_token },
        },
        data: {
          is_active: false,
          updated_at: updatedAt,
        },
      });

      return tx.account_devices.upsert({
        where: {
          push_token: data.push_token,
        },
        create: {
          ...data,
        },
        update: {
          account_id: data.account_id,
          is_active: true,
          installation_id: data.installation_id,
          platform: data.platform,
          registration_generation: data.registration_generation,
          updated_at: updatedAt,
          ...(data.device_name && { device_name: data.device_name }),
          ...(data.os_version && { os_version: data.os_version }),
        },
      });
    });
  }

  async deactivateOwned(id: string, account_id: string) {
    const result = await this.prisma.account_devices.updateMany({
      where: {
        id,
        account_id,
        is_active: true,
      },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    return result.count;
  }

  async deactivateIfTokenMatches(id: string, push_token: string) {
    const result = await this.prisma.account_devices.updateMany({
      where: {
        id,
        push_token,
        is_active: true,
      },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    return result.count;
  }

  async findByPushToken(push_token: string) {
    return this.prisma.account_devices.findUnique({
      where: {
        push_token,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.account_devices.findUnique({
      where: { id },
    });
  }

  async findActiveByAccountId(account_id: string) {
    return this.prisma.account_devices.findMany({
      where: {
        account_id,
        is_active: true,
        accounts: {
          is_active: true,
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findActiveOwnedDevice(params: {
    id: string;
    accountId: string;
    pushToken: string;
  }) {
    return this.prisma.account_devices.findFirst({
      where: {
        id: params.id,
        account_id: params.accountId,
        push_token: params.pushToken,
        is_active: true,
        accounts: {
          is_active: true,
        },
      },
    });
  }

  async findAll(params?: { skip?: number; take?: number; account_id: string }) {
    const where: account_devicesWhereInput = { account_id: params?.account_id };
    return this.prisma.$transaction([
      this.prisma.account_devices.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.account_devices.count({ where }),
    ]);
  }
}
