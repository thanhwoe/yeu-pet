import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetTransactionDto } from './dto/create-budget-transaction.dto';
import { UpdateBudgetTransactionDto } from './dto/update-budget-transaction.dto';
import { accounts } from '@app/generated/prisma/client';
import dayjs from 'dayjs';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { IBudgetTransactionsRepository } from '@app/interfaces/budget-transactions-repository.interface';
import { assertOwnerOrAdmin } from '@app/utils/ownership';

@Injectable()
export class BudgetTransactionsService {
  constructor(
    @Inject(IBudgetTransactionsRepository)
    private readonly budgetTransactionsRepository: IBudgetTransactionsRepository,
  ) {}
  create(
    user: accounts,
    createBudgetTransactionDto: CreateBudgetTransactionDto,
  ) {
    return this.budgetTransactionsRepository.create({
      accounts: {
        connect: {
          id: user.id,
        },
      },
      budget_categories: {
        connect: {
          id: createBudgetTransactionDto.categoryId,
        },
      },
      amount: createBudgetTransactionDto.amount,
      date: dayjs(createBudgetTransactionDto.date).toDate(),
      description: createBudgetTransactionDto.description,
    });
  }

  async findAll(
    user: accounts,
    pagination: PaginationDto,
    month?: number,
    year?: number,
  ) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    if (year && month) {
      const time = dayjs()
        .year(year)
        .month(month - 1);
      const start = time.startOf('month').toDate();
      const end = time.endOf('month').toDate();
      const [data, total] = await this.budgetTransactionsRepository.findAll({
        account_id: user.id,
        skip,
        take: limit,
        endDate: end,
        startDate: start,
      });
      return paginate(data, total, page, limit);
    }

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
    await this.assertOwner(user, id);

    return this.budgetTransactionsRepository.update(id, {
      budget_categories: {
        connect: {
          id: updateBudgetTransactionDto.categoryId,
        },
      },
      amount: updateBudgetTransactionDto.amount,
      date: updateBudgetTransactionDto.date
        ? dayjs(updateBudgetTransactionDto.date).toDate()
        : undefined,
      description: updateBudgetTransactionDto.description,
    });
  }

  async remove(user: accounts, id: string) {
    await this.assertOwner(user, id);
    await this.budgetTransactionsRepository.delete(id);
  }

  private async assertOwner(user: accounts, id: string) {
    const record = await this.budgetTransactionsRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Budget transaction with ID ${id} not found`);

    assertOwnerOrAdmin(user, record.account_id);

    return record;
  }
}
