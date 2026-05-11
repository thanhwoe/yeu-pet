import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { UpdateBudgetCategoryDto } from './dto/update-budget-category.dto';
import { BudgetCategoriesRepository } from './budget-categories.repository';

import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { accounts } from '@app/generated/prisma/client';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';

@Injectable()
export class BudgetCategoriesService {
  constructor(
    private readonly budgetCategoriesRepository: BudgetCategoriesRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
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

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.budgetCategoriesRepository.findAll({
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const category = await this.assertAbility(user, id, Action.Read);

    return category;
  }

  async update(
    user: accounts,
    id: string,
    updateBudgetCategoryDto: UpdateBudgetCategoryDto,
  ) {
    await this.assertAbility(user, id, Action.Update);

    return this.budgetCategoriesRepository.update(id, {
      color: updateBudgetCategoryDto.color,
      name: updateBudgetCategoryDto.name,
      emoji: updateBudgetCategoryDto.emoji,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertAbility(user, id, Action.Delete);

    await this.budgetCategoriesRepository.delete(id);
  }

  private async assertAbility(user: accounts, id: string, action: Action) {
    const record = await this.budgetCategoriesRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Budget Category with ID ${id} not found`);

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'BudgetCategories', record);

    return record;
  }
}
