import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';

import { PaginationDto } from '../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { accounts } from '@app/generated/prisma/client';
import { IBudgetCategoriesRepository } from '@app/interfaces/budget-categories-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';

@Injectable()
export class BudgetCategoriesService {
  constructor(
    @Inject(IBudgetCategoriesRepository)
    private readonly budgetCategoriesRepository: IBudgetCategoriesRepository,
  ) {}
  async create(
    user: accounts,
    createBudgetCategoryDto: CreateBudgetCategoryDto,
  ) {
    const category = await this.budgetCategoriesRepository.create({
      accounts: {
        connect: {
          id: user.id,
        },
      },
      name: createBudgetCategoryDto.name,
      color: createBudgetCategoryDto.color,
      emoji: createBudgetCategoryDto.emoji,
    });

    return category;
  }

  async findAll(user: accounts, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.budgetCategoriesRepository.findAll({
      account_id: user.id,
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const category = await this.assertOwner(user, id);

    return category;
  }

  async update(
    user: accounts,
    id: string,
    updateBudgetCategoryDto: UpdateBudgetCategoryDto,
  ) {
    await this.assertOwner(user, id);

    return this.budgetCategoriesRepository.update(id, {
      color: updateBudgetCategoryDto.color,
      name: updateBudgetCategoryDto.name,
      emoji: updateBudgetCategoryDto.emoji,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertOwner(user, id);

    await this.budgetCategoriesRepository.delete(id);
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.budgetCategoriesRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Budget Category with ID ${id} not found`);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }
}
