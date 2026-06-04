import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  budget_transactionsCreateInput,
  budget_transactionsUpdateInput,
  budget_transactionsWhereInput,
} from '@app/generated/prisma/models';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetTransactionsRepository implements IBudgetTransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: budget_transactionsCreateInput) {
    return this.prisma.budget_transactions.create({
      data,
    });
  }
  async update(id: string, data: budget_transactionsUpdateInput) {
    return this.prisma.budget_transactions.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  async delete(id: string) {
    return this.prisma.budget_transactions.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
  async findAll(params?: {
    skip?: number;
    take?: number;
    account_id: string;
    category_id?: string;
    pet_id?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: budget_transactionsWhereInput = {
      account_id: params?.account_id,
      category_id: params?.category_id,
      pet_id: params?.pet_id,
      deleted_at: null,
      date: {
        gte: params?.startDate,
        lte: params?.endDate,
      },
    };

    return this.prisma.$transaction([
      this.prisma.budget_transactions.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { date: 'desc' },
        include: this.include(),
      }),
      this.prisma.budget_transactions.count({ where }),
    ]);
  }
  async findById(id: string) {
    return this.prisma.budget_transactions.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async sum(params: {
    account_id: string;
    pet_id?: string;
    start_date: Date;
    end_date: Date;
  }) {
    const result = await this.prisma.budget_transactions.aggregate({
      where: {
        account_id: params.account_id,
        pet_id: params.pet_id,
        deleted_at: null,
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
    pet_id?: string;
    start_date: Date;
    end_date: Date;
  }) {
    return this.prisma.budget_transactions.groupBy({
      by: ['category_id'],
      where: {
        account_id: params.account_id,
        pet_id: params.pet_id,
        deleted_at: null,
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
    pet_id?: string;
    start_date: Date;
    end_date: Date;
  }) {
    return this.prisma.budget_transactions.findMany({
      where: {
        account_id: params.account_id,
        pet_id: params.pet_id,
        deleted_at: null,
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
  private include() {
    return {
      budget_categories: {
        select: {
          id: true,
          name: true,
          emoji: true,
          color: true,
        },
      },
      pets: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
    };
  }
}
