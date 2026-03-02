import { PrismaService } from '@app/database/prisma/prisma.service';
import { budget_categories } from '@app/generated/prisma/client';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetCategoriesRepository implements IBudgetCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: Pick<budget_categories, 'name' | 'color'>) {
    return this.prisma.budget_categories.create({ data });
  }
  async update(id: string, data: Partial<budget_categories>) {
    return this.prisma.budget_categories.update({
      where: { id },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
  }
  async delete(id: string) {
    return this.prisma.budget_categories.delete({
      where: { id },
    });
  }
  async findAll(params?: { skip?: number; take?: number }) {
    return this.prisma.budget_categories.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: { created_at: 'desc' },
    });
  }
  async findById(id: string) {
    return this.prisma.budget_categories.findUnique({ where: { id } });
  }
}
