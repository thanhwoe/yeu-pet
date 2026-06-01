import { PrismaService } from '@app/database/prisma/prisma.service';
import { budgets } from '@app/generated/prisma/client';
import { budgetsWhereInput } from '@app/generated/prisma/models';
import { IBudgetsRepository } from '@app/interfaces/budgets-repository.interface';
import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class BudgetsRepository implements IBudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Omit<budgets, 'id' | 'created_at' | 'updated_at'>) {
    return this.prisma.budgets.create({
      data,
    });
  }
  update(id: string, data: Partial<budgets>) {
    return this.prisma.budgets.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  updateAmount(params: {
    amount: Decimal;
    month: number;
    year: number;
    account_id: string;
  }) {
    return this.prisma.budgets.updateMany({
      where: {
        account_id: params.account_id,
        month: params.month,
        year: params.year,
      },
      data: {
        amount: params.amount,
      },
    });
  }
  delete(id: string) {
    return this.prisma.budgets.delete({ where: { id } });
  }
  findAll(params?: { skip?: number; take?: number; account_id: string }) {
    const where: budgetsWhereInput = {
      account_id: params?.account_id,
    };
    return this.prisma.$transaction([
      this.prisma.budgets.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.budgets.count({ where }),
    ]);
  }
  findById(id: string) {
    return this.prisma.budgets.findUnique({
      where: { id },
    });
  }
  findUnique(params: { account_id: string; month: number; year: number }) {
    return this.prisma.budgets.findUnique({
      where: {
        account_id_month_year: {
          account_id: params.account_id,
          month: params.month,
          year: params.year,
        },
      },
    });
  }
}
