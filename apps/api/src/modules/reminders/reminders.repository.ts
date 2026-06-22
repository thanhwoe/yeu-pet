import { PrismaService } from '@app/database/prisma/prisma.service';
import { reminder_status, reminder_type } from '@app/generated/prisma/client';
import {
  remindersCreateInput,
  remindersUpdateInput,
  remindersWhereInput,
} from '@app/generated/prisma/models';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class RemindersRepository implements IRemindersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: remindersCreateInput) {
    return this.prisma.reminders.create({
      data,
      include: this.include(),
    });
  }

  async update(id: string, data: remindersUpdateInput) {
    return this.prisma.reminders.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
      include: this.include(),
    });
  }

  async findById(id: string) {
    return this.prisma.reminders.findUnique({
      where: { id },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    pet_id?: string;
    status?: reminder_status;
    type?: reminder_type;
    startDate: Date;
    endDate: Date;
  }) {
    const where: remindersWhereInput = {
      account_id: params?.account_id,
      pet_id: params?.pet_id,
      status: params?.status,
      type: params?.type,
      scheduled_at: {
        gte: params?.startDate,
        lte: params?.endDate,
      },
    };
    return this.prisma.$transaction([
      this.prisma.reminders.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { scheduled_at: 'asc' },
        include: this.include(),
      }),
      this.prisma.reminders.count({ where }),
    ]);
  }

  async findMany(params: { where: remindersWhereInput }) {
    return this.prisma.reminders.findMany(params);
  }

  async claimForNotification(id: string) {
    const staleClaimBefore = new Date(Date.now() - 5 * 60 * 1000);
    const result = await this.prisma.reminders.updateMany({
      where: {
        id,
        status: reminder_status.pending,
        OR: [
          { notification_provider_id: null },
          {
            notification_provider_id: { startsWith: 'processing:' },
            updated_at: { lt: staleClaimBefore },
          },
        ],
      },
      data: {
        notification_provider_id: `processing:${randomUUID()}`,
        updated_at: new Date(),
      },
    });

    return result.count === 1;
  }

  async delete(id: string) {
    return this.prisma.reminders.delete({
      where: { id },
    });
  }

  private include() {
    return {
      pets: {
        select: {
          name: true,
          avatar_url: true,
        },
      },
    };
  }
}
