import { PrismaService } from '@app/database/prisma/prisma.service';
import { reminders } from '@app/generated/prisma/client';
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

  async findAll(params?: { skip?: number; take?: number; account_id: string }) {
    return this.prisma.reminders.findMany({
      where: {
        account_id: params?.account_id,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.reminders.delete({
      where: { id },
    });
  }
}
