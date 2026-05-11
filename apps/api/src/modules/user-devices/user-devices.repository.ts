import { PrismaService } from '@app/database/prisma/prisma.service';
import { account_devices } from '@app/generated/prisma/client';
import { account_devicesWhereInput } from '@app/generated/prisma/models';
import { IUserDevicesRepository } from '@app/interfaces/user-devices-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserDevicesRepository implements IUserDevicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Pick<
      account_devices,
      'device_name' | 'os_version' | 'platform' | 'push_token' | 'account_id'
    >,
  ) {
    return this.prisma.account_devices.upsert({
      where: {
        push_token: data.push_token,
      },
      create: {
        ...data,
      },
      update: {
        account_id: data.account_id,
        is_active: true,
        updated_at: new Date(),
        ...(data.device_name && { device_name: data.device_name }),
        ...(data.os_version && { os_version: data.os_version }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.account_devices.update({
      data: {
        is_active: false,
        updated_at: new Date(),
      },
      where: {
        id,
      },
    });
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

  async update(id: string, data: Partial<account_devices>) {
    return this.prisma.account_devices.update({
      where: {
        id,
      },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
}
