import { PrismaService } from '@app/database/prisma/prisma.service';
import { reminder_status } from '@app/generated/prisma/client';
import {
  remindersCreateInput,
  remindersUpdateInput,
  remindersWhereInput,
} from '@app/generated/prisma/models';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { Injectable } from '@nestjs/common';

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
    status?: reminder_status;
    startDate: Date;
    endDate: Date;
  }) {
    const where: remindersWhereInput = {
      account_id: params?.account_id,
      status: params?.status,
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
