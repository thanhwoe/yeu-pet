import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  budget_categoriesCreateInput,
  budget_categoriesUpdateInput,
  budget_categoriesWhereInput,
} from '@app/generated/prisma/models';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetCategoriesRepository implements IBudgetCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: budget_categoriesCreateInput) {
    return this.prisma.budget_categories.create({ data });
  }
  async update(id: string, data: budget_categoriesUpdateInput) {
    return this.prisma.budget_categories.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  async delete(id: string) {
    return this.prisma.budget_categories.update({
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
    account_id?: string;
  }) {
    const where: budget_categoriesWhereInput = {
      account_id: params?.account_id,
      deleted_at: null,
    };

    return this.prisma.$transaction([
      this.prisma.budget_categories.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.budget_categories.count({ where }),
    ]);
  }
  async findById(id: string) {
    return this.prisma.budget_categories.findFirst({
      where: { id, deleted_at: null },
    });
  }
  findManyByIds(ids: string[]) {
    return this.prisma.budget_categories.findMany({
      where: {
        id: { in: ids },
        deleted_at: null,
      },
    });
  }
}
