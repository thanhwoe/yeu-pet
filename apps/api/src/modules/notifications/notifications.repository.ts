import { PrismaService } from '@app/database/prisma/prisma.service';
import { notifications } from '@app/generated/prisma/client';
import { notificationsWhereInput } from '@app/generated/prisma/models';
import { INotificationsRepository } from '@app/interfaces/notifications-repository.interface';
import { Injectable } from '@nestjs/common';
import { JsonNull } from '@prisma/client/runtime/client';

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    data,
    ...payload
  }: Omit<
    notifications,
    'id' | 'created_at' | 'updated_at' | 'is_read' | 'read_at'
  >) {
    const dataObject = data ?? JsonNull;

    return this.prisma.notifications.create({
      data: { data: dataObject, ...payload },
    });
  }

  async update(id: string, { data, ...payload }: Partial<notifications>) {
    const dataObject = data ?? undefined;

    return this.prisma.notifications.update({
      where: {
        id,
      },
      data: {
        data: dataObject,
        updated_at: new Date(),
        ...payload,
      },
    });
  }

  async updateMany(
    account_id: string,
    { data, ...payload }: Partial<notifications>,
  ) {
    const dataObject = data ?? undefined;

    return this.prisma.notifications.updateMany({
      where: {
        account_id,
      },
      data: {
        data: dataObject,
        updated_at: new Date(),
        ...payload,
      },
    });
  }

  async updateManyUnRead(
    account_id: string,
    { data, ...payload }: Partial<notifications>,
  ) {
    const dataObject = data ?? undefined;

    return this.prisma.notifications.updateMany({
      where: {
        account_id,
        is_read: false,
      },
      data: {
        data: dataObject,
        updated_at: new Date(),
        ...payload,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.notifications.delete({
      where: { id },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    is_read?: boolean;
  }) {
    const where: notificationsWhereInput = {
      account_id: params?.account_id,
      is_read: params?.is_read,
    };

    return this.prisma.$transaction([
      this.prisma.notifications.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notifications.count({ where }),
    ]);
  }

  async findById(id: string) {
    return this.prisma.notifications.findUnique({
      where: { id },
    });
  }

  async countBadge(account_id: string) {
    return this.prisma.notifications.count({
      where: {
        account_id,
        is_read: false,
      },
    });
  }
}
