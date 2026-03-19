import { PrismaService } from '@app/database/prisma/prisma.service';
import { budget_transactions } from '@app/generated/prisma/client';
import { budget_transactionsWhereInput } from '@app/generated/prisma/models';
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
    const where: budget_transactionsWhereInput = {
      account_id: params?.account_id,
    };

    return this.prisma.$transaction([
      this.prisma.budget_transactions.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.budget_transactions.count({ where }),
    ]);
  }
  async findById(id: string) {
    return this.prisma.budget_transactions.findUnique({ where: { id } });
  }

  async sum(params: { account_id: string; start_date: Date; end_date: Date }) {
    const result = await this.prisma.budget_transactions.aggregate({
      where: {
        account_id: params.account_id,
        date: {
          gte: params.start_date,
          lte: params.end_date,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      amount: result._sum.amount,
      count: result._count,
    };
  }
  async sumGroupByCategory(params: {
    account_id: string;
    start_date: Date;
    end_date: Date;
  }) {
    return this.prisma.budget_transactions.groupBy({
      by: ['category_id'],
      where: {
        account_id: params.account_id,
        date: {
          gte: params.start_date,
          lte: params.end_date,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });
  }
  findAllByDate(params: {
    account_id: string;
    start_date: Date;
    end_date: Date;
  }) {
    return this.prisma.budget_transactions.findMany({
      where: {
        account_id: params.account_id,
        date: {
          gte: params.start_date,
          lte: params.end_date,
        },
      },
      select: {
        date: true,
        amount: true,
      },
      orderBy: { date: 'asc' },
    });
  }
}
