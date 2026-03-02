import { PrismaService } from '@app/database/prisma/prisma.service';
import { budget_transactions } from '@app/generated/prisma/client';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetTransactionsRepository implements IBudgetTransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<budget_transactions, 'id' | 'created_at' | 'updated_at'>,
  ) {
    return this.prisma.budget_transactions.create({
      data,
    });
  }
  async update(id: string, data: Partial<budget_transactions>) {
    return this.prisma.budget_transactions.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  async delete(id: string) {
    return this.prisma.budget_transactions.delete({
      where: { id },
    });
  }
  async findAll(params?: { skip?: number; take?: number; account_id: string }) {
    return this.prisma.budget_transactions.findMany({
      where: {
        account_id: params?.account_id,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }
  async findById(id: string) {
    return this.prisma.budget_transactions.findUnique({ where: { id } });
  }
}
