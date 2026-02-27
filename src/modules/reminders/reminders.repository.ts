import { PrismaService } from '@app/database/prisma/prisma.service';
import { reminder_status, reminders } from '@app/generated/prisma/client';
import { remindersWhereInput } from '@app/generated/prisma/models';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RemindersRepository implements IRemindersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<reminders, 'id' | 'updated_at' | 'created_at'>) {
    return this.prisma.reminders.create({
      data,
    });
  }

  async update(id: string, data: Partial<reminders>) {
    return this.prisma.reminders.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
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
  }) {
    return this.prisma.reminders.findMany({
      where: {
        account_id: params?.account_id,
        status: params?.status,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { scheduled_at: 'desc' },
    });
  }

  async findMany(params: { where: remindersWhereInput }) {
    return this.prisma.reminders.findMany(params);
  }

  async delete(id: string) {
    return this.prisma.reminders.delete({
      where: { id },
    });
  }
}
