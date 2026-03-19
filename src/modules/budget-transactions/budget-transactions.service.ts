import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetTransactionDto } from './dto/create-budget-transaction.dto';
import { UpdateBudgetTransactionDto } from './dto/update-budget-transaction.dto';
import { accounts } from '@app/generated/prisma/client';
import { BudgetTransactionsRepository } from './budget-transactions.repository';
import dayjs from 'dayjs';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../casl/casl.types';
import { assertAbility } from '../casl/casl.helper';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';

@Injectable()
export class BudgetTransactionsService {
  constructor(
    private readonly budgetTransactionsRepository: BudgetTransactionsRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}
  create(
    user: accounts,
    createBudgetTransactionDto: CreateBudgetTransactionDto,
  ) {
    return this.budgetTransactionsRepository.create({
      account_id: user.id,
      amount: createBudgetTransactionDto.amount,
      category_id: createBudgetTransactionDto.categoryId,
      date: dayjs(createBudgetTransactionDto.date).toDate(),
      description: createBudgetTransactionDto.description,
    });
  }

  async findAll(user: accounts, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.budgetTransactionsRepository.findAll({
      account_id: user.id,
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async update(
    user: accounts,
    id: string,
    updateBudgetTransactionDto: UpdateBudgetTransactionDto,
  ) {
    await this.assertAbility(user, id, Action.Update);

    return this.budgetTransactionsRepository.update(id, {
      amount: updateBudgetTransactionDto.amount,
      category_id: updateBudgetTransactionDto.categoryId,
      date: updateBudgetTransactionDto.date
        ? dayjs(updateBudgetTransactionDto.date).toDate()
        : undefined,
      description: updateBudgetTransactionDto.description,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertAbility(user, id, Action.Delete);
    await this.budgetTransactionsRepository.delete(id);
  }

  private async assertAbility(user: accounts, id: string, action: Action) {
    const record = await this.budgetTransactionsRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Budget transaction with ID ${id} not found`);

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'BudgetTransactions', record);

    return record;
  }
}
